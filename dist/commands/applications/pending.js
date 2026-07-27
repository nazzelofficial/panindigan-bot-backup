// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class ApplicationPendingCommand extends BaseCommand {
    constructor() {
        super({ name: 'application-pending', description: 'View pending (unreviewed) application submissions', category: 'applications', premiumTier: 'free', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, aliases: ['app-pending', 'apppending', 'appqueue'], examples: ['/application-pending'] });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder().setName(this.name).setDescription(this.description).addStringOption(o => o.setName('application').setDescription('Filter by application ID or name').setRequired(false)).setDMPermission(false));
    }
    async executeSlash(i) {
        await i.deferReply({ ephemeral: true });
        const filter = i.options.getString('application');
        const prisma = getPrismaClient();
        const applications = await prisma.application.findMany({ where: { guildId: i.guildId, ...(filter ? { OR: [{ id: filter }, { name: { contains: filter, mode: 'insensitive' } }] } : {}) } });
        if (!applications.length) {
            await i.editReply({ content: '📭 No applications found.' });
            return;
        }
        const appIds = applications.map(a => a.id);
        const pending = await prisma.applicationForm.findMany({
            where: { applicationId: { in: appIds }, status: 'pending' },
            orderBy: { createdAt: 'asc' },
            take: 20,
        });
        if (!pending.length) {
            await i.editReply({ content: '✅ No pending applications.' });
            return;
        }
        const embed = new EmbedBuilder().setTitle(`📋 Pending Applications (${pending.length})`).setColor(COLORS.warning)
            .setDescription(pending.slice(0, 15).map((p, idx) => {
            const app = applications.find(a => a.id === p.applicationId);
            return `**${idx + 1}.** ${app?.name || 'Unknown'}\nApplicant: <@${p.userId}> | ID: \`${p.id}\` | <t:${Math.floor(new Date(p.createdAt).getTime() / 1000)}:R>`;
        }).join('\n\n'))
            .setTimestamp();
        await i.editReply({ embeds: [embed] });
    }
    async executePrefix(m) {
        const prisma = getPrismaClient();
        const apps = await prisma.application.findMany({ where: { guildId: m.guildId } });
        const pending = await prisma.applicationForm.findMany({ where: { applicationId: { in: apps.map(a => a.id) }, status: 'pending' }, take: 10 });
        if (!pending.length) {
            await m.reply('✅ No pending applications.');
            return;
        }
        const embed = new EmbedBuilder().setTitle(`📋 Pending (${pending.length})`).setColor(COLORS.warning)
            .setDescription(pending.map((p, i) => `**${i + 1}.** Applicant: <@${p.userId}> | ID: \`${p.id}\``).join('\n'));
        await m.reply({ embeds: [embed] });
    }
}
export default ApplicationPendingCommand;
