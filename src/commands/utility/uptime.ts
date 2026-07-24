import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class UptimeCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'uptime',
      description: 'Display the bot\'s uptime',
      category: 'utility',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: [],
      examples: ['/uptime', 'p!uptime'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const uptime = this.formatUptime(interaction.client.uptime || 0);

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} ⏱️ Bot Uptime`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Uptime', value: uptime, inline: true },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const uptime = this.formatUptime(message.client.uptime || 0);

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} ⏱️ Bot Uptime`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Uptime', value: uptime, inline: true },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }

  private formatUptime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${days}d ${hours}h ${minutes}m ${secs}s`;
  }
}

export default UptimeCommand;
