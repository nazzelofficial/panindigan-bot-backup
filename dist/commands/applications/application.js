// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { SlashCommandBuilder, PermissionFlagsBits, } from 'discord.js';
import { EmbedManager } from '../../structures/EmbedManager.js';
import { ModalManager } from '../../structures/ModalManager.js';
import { ButtonManager } from '../../structures/ButtonManager.js';
import { ErrorHandler } from '../../handlers/ErrorHandler.js';
import { SuccessHandler } from '../../handlers/SuccessHandler.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class ApplicationCommand extends BaseCommand {
    constructor() {
        super({ name: 'application', description: 'Manage and submit applications', category: 'applications', premiumTier: 'free', cooldown: 10, guildOnly: true, slashCommand: true, prefixCommand: false, aliases: ['apply', 'app'], examples: ['/application create', '/application list', '/application view <id>'] });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
            .addSubcommand(s => s.setName('create').setDescription('Create a new application form').addStringOption(o => o.setName('name').setDescription('Form name').setRequired(true)).addStringOption(o => o.setName('description').setDescription('What this application is for').setRequired(false)))
            .addSubcommand(s => s.setName('list').setDescription('List all application forms in this server'))
            .addSubcommand(s => s.setName('apply').setDescription('Submit an application').addStringOption(o => o.setName('form').setDescription('Form name').setRequired(true)))
            .addSubcommand(s => s.setName('view').setDescription('View an application').addStringOption(o => o.setName('id').setDescription('Application ID').setRequired(true)))
            .addSubcommand(s => s.setName('accept').setDescription('Accept an application').addStringOption(o => o.setName('id').setDescription('Application ID').setRequired(true)))
            .addSubcommand(s => s.setName('deny').setDescription('Deny an application').addStringOption(o => o.setName('id').setDescription('Application ID').setRequired(true)).addStringOption(o => o.setName('reason').setDescription('Reason for denial').setRequired(false)))
            .addSubcommand(s => s.setName('delete').setDescription('Delete an application form').addStringOption(o => o.setName('name').setDescription('Form name').setRequired(true)))
            .setDMPermission(false));
    }
    async executeSlash(i) {
        const sub = i.options.getSubcommand();
        const prisma = getPrismaClient();
        if (sub === 'create') {
            if (!i.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
                await ErrorHandler.permissions(i, 'Manage Server');
                return;
            }
            const name = i.options.getString('name', true);
            const description = i.options.getString('description') || 'No description provided.';
            await prisma.guild.upsert({ where: { guildId: i.guildId }, create: { guildId: i.guildId }, update: {} });
            await prisma.applicationForm.upsert({
                where: { guildId_name: { guildId: i.guildId, name } },
                create: { guildId: i.guildId, name, description, questions: [], createdBy: i.user.id },
                update: { description, updatedAt: new Date() },
            });
            await SuccessHandler.configuration(i, 'Application Form', name);
        }
        else if (sub === 'list') {
            const forms = await prisma.applicationForm.findMany({ where: { guildId: i.guildId, active: true } });
            if (!forms.length) {
                await ErrorHandler.notFound(i, 'Application Forms', 'active forms');
                return;
            }
            const embed = EmbedManager.info('📋 Application Forms', forms.map((f) => `**${f.name}** — ${f.description}\n${(f.questions || []).length} question(s)`).join('\n\n'));
            await i.reply({ embeds: [embed] });
        }
        else if (sub === 'apply') {
            const formName = i.options.getString('form', true);
            const form = await prisma.applicationForm.findFirst({ where: { guildId: i.guildId, name: formName, active: true } });
            if (!form) {
                await ErrorHandler.notFound(i, 'Form', formName);
                return;
            }
            const questions = form.questions || [];
            if (!questions.length) {
                await ErrorHandler.generic(i, new Error('This form has no questions set up yet.'));
                return;
            }
            // Build modal with first 5 questions
            const modal = ModalManager.custom(`app_modal:${form.id}`, form.name, questions.slice(0, 5).map((q, idx) => ({
                customId: `q_${idx}`,
                label: q.question,
                placeholder: 'Your answer...',
                required: q.required ?? true,
                maxLength: 1000,
            })));
            await i.showModal(modal);
            const submitted = await i.awaitModalSubmit({ time: 300000, filter: (mi) => mi.customId === `app_modal:${form.id}` }).catch(() => null);
            if (!submitted)
                return;
            const answers = questions.slice(0, 5).map((q, idx) => ({
                question: q.question, answer: submitted.fields.getTextInputValue(`q_${idx}`),
            }));
            const application = await prisma.application.create({
                data: { formId: form.id, guildId: i.guildId, applicantId: i.user.id, answers, status: 'pending', submittedAt: new Date() },
            });
            // Send to review channel if set
            if (form.reviewChannelId) {
                const reviewCh = i.guild.channels.cache.get(form.reviewChannelId);
                if (reviewCh?.isTextBased()) {
                    const reviewEmbed = EmbedManager.info(`📋 New Application: ${form.name}`)
                        .addFields({ name: 'Applicant', value: `${i.user.tag} (${i.user.id})`, inline: true }, { name: 'Application ID', value: application.id, inline: true }, ...answers.map((a) => ({ name: a.question, value: a.answer, inline: false }))).setTimestamp();
                    const row = ButtonManager.confirmRow(`app_accept:${application.id}`, `app_deny:${application.id}`, 'Accept', 'Deny');
                    await reviewCh.send({ embeds: [reviewEmbed], components: [row] });
                }
            }
            await SuccessHandler.generic(submitted, 'Application Submitted', `Your application for **${form.name}** has been submitted! (ID: \`${application.id}\`)`);
        }
        else if (sub === 'view') {
            const id = i.options.getString('id', true);
            const app = await prisma.application.findUnique({ where: { id }, include: { form: true } });
            if (!app || app.guildId !== i.guildId) {
                await ErrorHandler.notFound(i, 'Application', id);
                return;
            }
            const embed = EmbedManager.info(`📋 Application ${id.slice(0, 8)}...`)
                .addFields({ name: 'Form', value: app.form.name, inline: true }, { name: 'Status', value: app.status, inline: true }, { name: 'Applicant', value: `<@${app.applicantId}>`, inline: true }, ...app.answers.map((a) => ({ name: a.question, value: a.answer, inline: false }))).setTimestamp(app.submittedAt);
            await i.reply({ embeds: [embed], ephemeral: true });
        }
        else if (sub === 'accept' || sub === 'deny') {
            if (!i.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
                await ErrorHandler.permissions(i, 'Manage Server');
                return;
            }
            const id = i.options.getString('id', true);
            const reason = i.options.getString('reason') || 'No reason provided.';
            const newStatus = sub === 'accept' ? 'accepted' : 'denied';
            await prisma.application.update({ where: { id }, data: { status: newStatus, reviewerId: i.user.id, reviewedAt: new Date(), reviewNotes: reason } });
            await SuccessHandler.moderation(i, newStatus.charAt(0).toUpperCase() + newStatus.slice(1), `Application \`${id.slice(0, 8)}...\``, reason);
        }
        else if (sub === 'delete') {
            if (!i.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
                await ErrorHandler.permissions(i, 'Manage Server');
                return;
            }
            const name = i.options.getString('name', true);
            await prisma.applicationForm.updateMany({ where: { guildId: i.guildId, name }, data: { active: false } });
            await SuccessHandler.configuration(i, 'Form Deactivation', name);
        }
    }
    async executePrefix(m, _args) {
        await ErrorHandler.generic(m, new Error('Please use `/application` slash commands for applications.'));
    }
}
export default ApplicationCommand;
//# sourceMappingURL=application.js.map