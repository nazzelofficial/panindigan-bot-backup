import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import {
  ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder,
  PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder,
  ComponentType, ButtonBuilder, ButtonStyle,
} from 'discord.js';
import { COLORS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class ApplicationCommand extends BaseCommand {
  constructor() {
    super({ name: 'application', description: 'Manage and submit applications', category: 'applications', premiumTier: 'silver', cooldown: 10, guildOnly: true, slashCommand: true, prefixCommand: false, aliases: ['apply', 'app'], examples: ['/application create', '/application list', '/application view <id>'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addSubcommand(s => s.setName('create').setDescription('Create a new application form').addStringOption(o => o.setName('name').setDescription('Form name').setRequired(true)).addStringOption(o => o.setName('description').setDescription('What this application is for').setRequired(false)))
      .addSubcommand(s => s.setName('list').setDescription('List all application forms in this server'))
      .addSubcommand(s => s.setName('apply').setDescription('Submit an application').addStringOption(o => o.setName('form').setDescription('Form name').setRequired(true)))
      .addSubcommand(s => s.setName('view').setDescription('View an application').addStringOption(o => o.setName('id').setDescription('Application ID').setRequired(true)))
      .addSubcommand(s => s.setName('accept').setDescription('Accept an application').addStringOption(o => o.setName('id').setDescription('Application ID').setRequired(true)))
      .addSubcommand(s => s.setName('deny').setDescription('Deny an application').addStringOption(o => o.setName('id').setDescription('Application ID').setRequired(true)).addStringOption(o => o.setName('reason').setDescription('Reason for denial').setRequired(false)))
      .addSubcommand(s => s.setName('delete').setDescription('Delete an application form').addStringOption(o => o.setName('name').setDescription('Form name').setRequired(true)))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const sub = i.options.getSubcommand();
    const prisma = getPrismaClient();

    if (sub === 'create') {
      if (!i.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
        await i.reply({ content: '❌ You need Manage Server permission to create forms.', ephemeral: true }); return;
      }
      const name = i.options.getString('name', true);
      const description = i.options.getString('description') || 'No description provided.';
      await prisma.guild.upsert({ where: { guildId: i.guildId! }, create: { guildId: i.guildId! }, update: {} });
      await (prisma as any).applicationForm.upsert({
        where: { guildId_name: { guildId: i.guildId!, name } },
        create: { guildId: i.guildId!, name, description, questions: [], createdBy: i.user.id },
        update: { description, updatedAt: new Date() },
      });
      await i.reply({ content: `✅ Application form **${name}** created!`, ephemeral: true });

    } else if (sub === 'list') {
      const forms = await (prisma as any).applicationForm.findMany({ where: { guildId: i.guildId!, active: true } });
      if (!forms.length) { await i.reply({ content: '❌ No application forms found.', ephemeral: true }); return; }
      const embed = new EmbedBuilder().setTitle('📋 Application Forms').setColor(COLORS.default)
        .setDescription(forms.map((f: any) => `**${f.name}** — ${f.description}\n${(f.questions || []).length} question(s)`).join('\n\n'));
      await i.reply({ embeds: [embed] });

    } else if (sub === 'apply') {
      const formName = i.options.getString('form', true);
      const form = await (prisma as any).applicationForm.findFirst({ where: { guildId: i.guildId!, name: formName, active: true } });
      if (!form) { await i.reply({ content: `❌ Form **${formName}** not found.`, ephemeral: true }); return; }

      const questions = form.questions as any[] || [];
      if (!questions.length) { await i.reply({ content: '❌ This form has no questions set up yet.', ephemeral: true }); return; }

      // Build modal with first 5 questions
      const modal = new ModalBuilder().setCustomId(`app_modal:${form.id}`).setTitle(`Apply: ${form.name}`);
      questions.slice(0, 5).forEach((q: any, idx: number) => {
        modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder().setCustomId(`q_${idx}`).setLabel(q.question).setStyle(TextInputStyle.Paragraph).setRequired(q.required ?? true).setMaxLength(1000)
        ));
      });

      await i.showModal(modal);
      const submitted = await i.awaitModalSubmit({ time: 300000, filter: (mi) => mi.customId === `app_modal:${form.id}` }).catch(() => null);
      if (!submitted) return;

      const answers = questions.slice(0, 5).map((q: any, idx: number) => ({
        question: q.question, answer: submitted.fields.getTextInputValue(`q_${idx}`),
      }));

      const application = await (prisma as any).application.create({
        data: { formId: form.id, guildId: i.guildId!, applicantId: i.user.id, answers, status: 'pending', submittedAt: new Date() },
      });

      // Send to review channel if set
      if (form.reviewChannelId) {
        const reviewCh = i.guild!.channels.cache.get(form.reviewChannelId);
        if (reviewCh?.isTextBased()) {
          const reviewEmbed = new EmbedBuilder().setTitle(`📋 New Application: ${form.name}`).setColor(COLORS.warning)
            .addFields(
              { name: 'Applicant', value: `${i.user.tag} (${i.user.id})`, inline: true },
              { name: 'Application ID', value: application.id, inline: true },
              ...answers.map((a: any) => ({ name: a.question, value: a.answer, inline: false })),
            ).setTimestamp();
          const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId(`app_accept:${application.id}`).setLabel('✅ Accept').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`app_deny:${application.id}`).setLabel('❌ Deny').setStyle(ButtonStyle.Danger),
          );
          await (reviewCh as any).send({ embeds: [reviewEmbed], components: [row] });
        }
      }

      await submitted.reply({ content: `✅ Your application for **${form.name}** has been submitted! (ID: \`${application.id}\`)`, ephemeral: true });

    } else if (sub === 'view') {
      const id = i.options.getString('id', true);
      const app = await (prisma as any).application.findUnique({ where: { id }, include: { form: true } });
      if (!app || app.guildId !== i.guildId) { await i.reply({ content: '❌ Application not found.', ephemeral: true }); return; }
      const embed = new EmbedBuilder().setTitle(`📋 Application ${id.slice(0, 8)}...`).setColor(COLORS.default)
        .addFields(
          { name: 'Form', value: app.form.name, inline: true },
          { name: 'Status', value: app.status, inline: true },
          { name: 'Applicant', value: `<@${app.applicantId}>`, inline: true },
          ...(app.answers as any[]).map((a: any) => ({ name: a.question, value: a.answer, inline: false })),
        ).setTimestamp(app.submittedAt);
      await i.reply({ embeds: [embed], ephemeral: true });

    } else if (sub === 'accept' || sub === 'deny') {
      if (!i.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
        await i.reply({ content: '❌ You need Manage Server to review applications.', ephemeral: true }); return;
      }
      const id = i.options.getString('id', true);
      const reason = i.options.getString('reason') || 'No reason provided.';
      const newStatus = sub === 'accept' ? 'accepted' : 'denied';
      await (prisma as any).application.update({ where: { id }, data: { status: newStatus, reviewerId: i.user.id, reviewedAt: new Date(), reviewNotes: reason } });
      await i.reply({ content: `✅ Application \`${id.slice(0, 8)}...\` has been **${newStatus}**.`, ephemeral: true });

    } else if (sub === 'delete') {
      if (!i.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
        await i.reply({ content: '❌ Manage Server required.', ephemeral: true }); return;
      }
      const name = i.options.getString('name', true);
      await (prisma as any).applicationForm.updateMany({ where: { guildId: i.guildId!, name }, data: { active: false } });
      await i.reply({ content: `✅ Form **${name}** deactivated.`, ephemeral: true });
    }
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    await m.reply('❌ Please use `/application` slash commands for applications.');
  }
}
export default ApplicationCommand;
