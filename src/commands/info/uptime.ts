import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class UptimeCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'uptime',
      description: 'Display the bot uptime',
      category: 'info',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['up'],
      examples: ['/uptime', 'p!uptime'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const uptime = this.formatUptime(interaction.client.uptime!);

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} ⏱️ Uptime`)
      .setColor(COLORS.info)
      .setDescription(uptime)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const uptime = this.formatUptime(message.client.uptime!);

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} ⏱️ Uptime`)
      .setColor(COLORS.info)
      .setDescription(uptime)
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }

  private formatUptime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    const d = days;
    const h = hours % 24;
    const m = minutes % 60;
    const s = seconds % 60;

    return `${d}d ${h}h ${m}m ${s}s`;
  }
}

export default UptimeCommand;
