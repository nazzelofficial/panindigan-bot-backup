import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class PickColorCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'pickcolor',
      description: 'Pick a random color',
      category: 'fun',
      cooldown: 3,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['randomcolor', 'color'],
      examples: ['/pickcolor', 'p!pickcolor'],
    };
    super(options);
  }

  private colors = [
    { name: 'Red', hex: '#FF0000' },
    { name: 'Blue', hex: '#0000FF' },
    { name: 'Green', hex: '#00FF00' },
    { name: 'Yellow', hex: '#FFFF00' },
    { name: 'Purple', hex: '#800080' },
    { name: 'Orange', hex: '#FFA500' },
    { name: 'Pink', hex: '#FFC0CB' },
    { name: 'Cyan', hex: '#00FFFF' },
    { name: 'Magenta', hex: '#FF00FF' },
    { name: 'Lime', hex: '#00FF00' },
    { name: 'Teal', hex: '#008080' },
    { name: 'Indigo', hex: '#4B0082' },
    { name: 'Violet', hex: '#EE82EE' },
    { name: 'Gold', hex: '#FFD700' },
    { name: 'Silver', hex: '#C0C0C0' },
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const color = this.colors[Math.floor(Math.random() * this.colors.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 🎨 Random Color`)
      .setColor(parseInt(color.hex.replace('#', ''), 16))
      .setDescription(`I picked: **${color.name}**`)
      .addFields([
        { name: 'Color', value: color.name, inline: true },
        { name: 'Hex', value: color.hex, inline: true },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const color = this.colors[Math.floor(Math.random() * this.colors.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 🎨 Random Color`)
      .setColor(parseInt(color.hex.replace('#', ''), 16))
      .setDescription(`I picked: **${color.name}**`)
      .addFields([
        { name: 'Color', value: color.name, inline: true },
        { name: 'Hex', value: color.hex, inline: true },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default PickColorCommand;
