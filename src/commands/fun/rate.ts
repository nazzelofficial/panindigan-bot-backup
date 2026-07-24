import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class RateCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'rate',
      description: 'Rate something or someone',
      category: 'fun',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['rating', 'score'],
      examples: ['/rate pizza', 'p!rate @user'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getString('target') || 'you';
    const rating = Math.floor(Math.random() * 10) + 1;
    const stars = '⭐'.repeat(rating) + '☆'.repeat(10 - rating);

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} Rating`)
      .setColor(COLORS.info)
      .setDescription(`I rate ${target} ${rating}/10`)
      .addFields([
        { name: 'Rating', value: stars, inline: false },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const target = args.join(' ') || 'you';
    const rating = Math.floor(Math.random() * 10) + 1;
    const stars = '⭐'.repeat(rating) + '☆'.repeat(10 - rating);

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} Rating`)
      .setColor(COLORS.info)
      .setDescription(`I rate ${target} ${rating}/10`)
      .addFields([
        { name: 'Rating', value: stars, inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default RateCommand;
