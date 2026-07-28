// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class ApplicationResponsesCommand extends BaseCommand {
  constructor() {
    super({ name: 'application-responses', description: 'View a specific applicant\'s responses', category: 'applications', premiumTier: 'free', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, aliases: ['app-responses', 'appresponses', 'appreview'], examples: ['/application-responses <form-id>'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addStringOption(o => o.setName('form_id').setDescription('Form submission ID').setRequired(true))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  private async getResponses(guildId: string, formId: string): Promise<EmbedBuilder | string> {
    const prisma = getPrismaClient();
    const form = await prisma.applicationForm.findFirst({ where: { id: formId } });
    if (!form) return '❌ Submission not found.';

    const app = await prisma.application.findFirst({ where: { id: form.applicationId, guildId } });
    if (!app) return '❌ Application not found.';

    const answers = form.answers as Record<string, string> || {};
    const fields = Object.entries(answers).map(([q, a]) => ({ name: q.slice(0, 100), value: String(a).slice(0, 1024), inline: false }));

    return new EmbedBuilder()
      .setTitle(`📋 ${app.name} — Submission`)
      .setColor(form.status === 'accepted' ? COLORS.success : form.status === 'denied' ? COLORS.error : COLORS.warning as any)
      .setDescription(`**Applicant:** <@${form.userId}>\n**Status:** ${form.status.toUpperCase()}\n**Submitted:** <t:${Math.floor(new Date(form.createdAt).getTime() / 1000)}:F>`)
      .addFields(...fields.slice(0, 10))
      .setTimestamp();
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const formId = i.options.getString('form_id', true);
    const result = await this.getResponses(i.guildId!, formId);
    if (typeof result === 'string') await i.reply({ content: result, ephemeral: true });
    else await i.reply({ embeds: [result] });
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    if (!args[0]) { await m.reply('❌ Usage: `p!application-responses <form-id>`'); return; }
    const result = await this.getResponses(m.guildId!, args[0]);
    if (typeof result === 'string') await m.reply(result);
    else await m.reply({ embeds: [result] });
  }
}
export default ApplicationResponsesCommand;
