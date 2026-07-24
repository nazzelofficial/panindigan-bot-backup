import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import * as fs from 'fs';
import * as path from 'path';

export class ClearErrorsCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'clearerrors',
      description: 'Clear the error log file (Owner only)',
      category: 'owner',
      premiumTier: 'free',
      cooldown: 0,
      userPermissions: [],
      botPermissions: [],
      ownerOnly: true,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['clearlog', 'clearlogs'],
      examples: ['/clearerrors', 'p!clearerrors'],
    };
    super(options);
  }

  private clearErrorLog(): { success: boolean; previousSize: number; error?: string } {
    const logPath = path.resolve(process.cwd(), 'logs', 'error.log');
    try {
      let previousSize = 0;
      if (fs.existsSync(logPath)) {
        const stat = fs.statSync(logPath);
        previousSize = stat.size;
        fs.truncateSync(logPath, 0);
      } else {
        // Ensure directory exists and create empty file
        fs.mkdirSync(path.dirname(logPath), { recursive: true });
        fs.writeFileSync(logPath, '');
      }
      return { success: true, previousSize };
    } catch (err: any) {
      return { success: false, previousSize: 0, error: err?.message || 'Unknown error' };
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    const { success, previousSize, error } = this.clearErrorLog();

    const embed = new EmbedBuilder()
      .setColor(success ? COLORS.success : COLORS.error)
      .setTitle(`${success ? EMOJIS.success : EMOJIS.error} Error Log`)
      .setDescription(
        success
          ? `Error log has been cleared successfully.`
          : `Failed to clear error log: \`${error}\``
      )
      .setFooter({ text: `Requested by ${interaction.user.tag}` })
      .setTimestamp();

    if (success) {
      embed.addFields({ name: '🗑️ Cleared', value: this.formatBytes(previousSize), inline: true });
    }

    await interaction.editReply({ embeds: [embed] });
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const { success, previousSize, error } = this.clearErrorLog();

    const embed = new EmbedBuilder()
      .setColor(success ? COLORS.success : COLORS.error)
      .setTitle(`${success ? EMOJIS.success : EMOJIS.error} Error Log`)
      .setDescription(
        success
          ? `Error log has been cleared successfully.`
          : `Failed to clear error log: \`${error}\``
      )
      .setFooter({ text: `Requested by ${message.author.tag}` })
      .setTimestamp();

    if (success) {
      embed.addFields({ name: '🗑️ Cleared', value: this.formatBytes(previousSize), inline: true });
    }

    await message.reply({ embeds: [embed] });
  }
}

export default ClearErrorsCommand;
