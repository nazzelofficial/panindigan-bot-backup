// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class RoleColorCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'rolecolor',
      description: 'Display the color of a role',
      category: 'info',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['rc', 'rolecolour'],
      examples: ['/rolecolor @role', 'p!rolecolor @role'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const role = interaction.options.getRole('role');
    if (!role) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a role.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const color = role.color || COLORS.info;
    const hexColor = role.hexColor || 'None';

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Role Color`)
      .setColor(color)
      .addFields([
        { name: 'Role', value: role.name, inline: true },
        { name: 'Hex Color', value: hexColor, inline: true },
        { name: 'RGB', value: this.hexToRgb(hexColor) || 'None', inline: true },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const role = message.mentions.roles.first();
    if (!role) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a role.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const color = role.color || COLORS.info;
    const hexColor = role.hexColor || 'None';

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Role Color`)
      .setColor(color)
      .addFields([
        { name: 'Role', value: role.name, inline: true },
        { name: 'Hex Color', value: hexColor, inline: true },
        { name: 'RGB', value: this.hexToRgb(hexColor) || 'None', inline: true },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }

  private hexToRgb(hex: string): string | null {
    if (hex === 'None' || !hex.startsWith('#')) return null;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  }
}

export default RoleColorCommand;
