// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class PickNumberCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'picknumber',
      description: 'Pick a random number from a range',
      category: 'fun',
      cooldown: 3,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['randomnumber', 'rng'],
      examples: ['/picknumber 1 10', 'p!picknumber 1 100'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const min = interaction.options.getInteger('min') || 1;
    const max = interaction.options.getInteger('max') || 10;
    const result = Math.floor(Math.random() * (max - min + 1)) + min;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 🔢 Random Number`)
      .setColor(COLORS.info)
      .setDescription(`I picked: **${result}**`)
      .addFields([
        { name: 'Range', value: `${min} - ${max}`, inline: true },
        { name: 'Result', value: result.toString(), inline: true },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const min = args[0] ? parseInt(args[0]) : 1;
    const max = args[1] ? parseInt(args[1]) : 10;
    const validMin = isNaN(min) ? 1 : min;
    const validMax = isNaN(max) ? 10 : max;
    const result = Math.floor(Math.random() * (validMax - validMin + 1)) + validMin;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 🔢 Random Number`)
      .setColor(COLORS.info)
      .setDescription(`I picked: **${result}**`)
      .addFields([
        { name: 'Range', value: `${validMin} - ${validMax}`, inline: true },
        { name: 'Result', value: result.toString(), inline: true },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default PickNumberCommand;
