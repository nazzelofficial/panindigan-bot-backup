import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class RoleColorCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'rolecolor',
      description: 'Display the color of a role',
      category: 'utility',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: [],
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

    const hexColor = role.hexColor;
    const rgbColor = this.hexToRgb(hexColor);

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 🎨 ${role.name} Color`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Role', value: role.name, inline: true },
        { name: 'Hex', value: hexColor || 'Default', inline: true },
        { name: 'RGB', value: rgbColor || 'Default', inline: true },
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

    const hexColor = role.hexColor;
    const rgbColor = this.hexToRgb(hexColor);

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 🎨 ${role.name} Color`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Role', value: role.name, inline: true },
        { name: 'Hex', value: hexColor || 'Default', inline: true },
        { name: 'RGB', value: rgbColor || 'Default', inline: true },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }

  private hexToRgb(hex: string): string | null {
    if (!hex) return null;
    
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return null;

    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);

    return `rgb(${r}, ${g}, ${b})`;
  }
}

export default RoleColorCommand;
