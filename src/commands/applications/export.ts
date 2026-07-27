// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, SlashCommandBuilder, AttachmentBuilder, PermissionFlagsBits } from 'discord.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class ApplicationExportCommand extends BaseCommand {
  constructor() {
    super({ name: 'application-export', description: 'Export all submissions for an application as a CSV file', category: 'applications', premiumTier: 'free', cooldown: 10, guildOnly: true, slashCommand: true, prefixCommand: true, userPermissions: [PermissionFlagsBits.ManageGuild], aliases: ['app-export', 'appexport'], examples: ['/application-export <id>'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addStringOption(o => o.setName('id').setDescription('Application ID').setRequired(true))
      .addStringOption(o => o.setName('status').setDescription('Filter by status').setRequired(false).addChoices({ name: 'All', value: 'all' }, { name: 'Pending', value: 'pending' }, { name: 'Accepted', value: 'accepted' }, { name: 'Denied', value: 'denied' }))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  private async export(guildId: string, id: string, status: string): Promise<{ content: string; filename: string } | string> {
    const prisma = getPrismaClient();
    const app = await prisma.application.findFirst({ where: { id, guildId } });
    if (!app) return '❌ Application not found.';

    const where: any = { applicationId: id };
    if (status !== 'all') where.status = status;

    const forms = await prisma.applicationForm.findMany({ where, orderBy: { createdAt: 'desc' } });
    if (!forms.length) return '📭 No submissions found.';

    const headers = ['ID', 'User ID', 'Status', 'Submitted At', 'Answers'];
    const rows = forms.map(f => [
      f.id,
      f.userId,
      f.status,
      new Date(f.createdAt).toISOString(),
      JSON.stringify(f.answers || {}),
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));

    const csv = [headers.join(','), ...rows].join('\n');
    return { content: csv, filename: `${app.name.replace(/[^a-z0-9]/gi, '_')}_submissions_${Date.now()}.csv` };
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const id = i.options.getString('id', true);
    const status = i.options.getString('status') || 'all';
    await i.deferReply({ ephemeral: true });
    const result = await this.export(i.guildId!, id, status);
    if (typeof result === 'string') { await i.editReply({ content: result }); return; }
    const attachment = new AttachmentBuilder(Buffer.from(result.content, 'utf-8'), { name: result.filename });
    await i.editReply({ content: '✅ Export ready!', files: [attachment] });
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    if (!args[0]) { await m.reply('❌ Usage: `p!application-export <id> [pending|accepted|denied|all]`'); return; }
    const result = await this.export(m.guildId!, args[0], args[1] || 'all');
    if (typeof result === 'string') { await m.reply(result); return; }
    const attachment = new AttachmentBuilder(Buffer.from(result.content, 'utf-8'), { name: result.filename });
    await m.reply({ content: '✅ Export:', files: [attachment] });
  }
}
export default ApplicationExportCommand;
