import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class UnflipCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'unflip',
      description: 'Put the table back',
      category: 'fun',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['fixtable', 'calm'],
      examples: ['/unflip', 'p!unflip'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} ┬─┬ ノ( ゜-゜ノ) Table Unflip`)
      .setColor(COLORS.info)
      .setDescription(`${interaction.user} puts the table back ┬─┬ ノ( ゜-゜ノ)`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} ┬─┬ ノ( ゜-゜ノ) Table Unflip`)
      .setColor(COLORS.info)
      .setDescription(`${message.author} puts the table back ┬─┬ ノ( ゜-゜ノ)`)
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default UnflipCommand;
