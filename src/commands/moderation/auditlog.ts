import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class AuditLogCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'auditlog',
      description: 'View recent audit log entries',
      category: 'moderation',
      cooldown: 10,
      userPermissions: [PermissionFlagsBits.ViewAuditLog],
      botPermissions: [PermissionFlagsBits.ViewAuditLog],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['audit', 'logs'],
      examples: ['/auditlog', 'p!auditlog'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const limit = interaction.options.getInteger('limit') || 10;

    if (!interaction.guild) return;

    try {
      const auditLogs = await interaction.guild.fetchAuditLogs({ limit: Math.min(limit, 25) });

      if (auditLogs.entries.size === 0) {
        await interaction.reply({ content: '❌ No recent audit log entries.', ephemeral: true });
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.info} Recent Audit Logs`)
        .setColor(COLORS.info)
        .addFields([
          { name: 'Total Entries', value: auditLogs.entries.size.toString(), inline: true },
        ])
        .setTimestamp();

      const logList = auditLogs.entries.slice(0, 10).map(entry => {
        const executor = entry.executor?.tag || 'Unknown';
        const target = entry.target ? (entry.target as any).tag || 'Unknown' : 'Unknown';
        const action = entry.action.toString();
        return `**${action}** by ${executor} on ${target}`;
      }).join('\n');

      embed.addField('Recent Actions', logList.substring(0, 1024));

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to fetch audit logs.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const limit = parseInt(args[0]) || 10;

    if (!message.guild) return;

    try {
      const auditLogs = await message.guild.fetchAuditLogs({ limit: Math.min(limit, 25) });

      if (auditLogs.entries.size === 0) {
        await message.reply('❌ No recent audit log entries.');
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.info} Recent Audit Logs`)
        .setColor(COLORS.info)
        .addFields([
          { name: 'Total Entries', value: auditLogs.entries.size.toString(), inline: true },
        ])
        .setTimestamp();

      const logList = auditLogs.entries.slice(0, 10).map(entry => {
        const executor = entry.executor?.tag || 'Unknown';
        const target = entry.target ? (entry.target as any).tag || 'Unknown' : 'Unknown';
        const action = entry.action.toString();
        return `**${action}** by ${executor} on ${target}`;
      }).join('\n');

      embed.addField('Recent Actions', logList.substring(0, 1024));

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to fetch audit logs.');
    }
  }
}

export default AuditLogCommand;
