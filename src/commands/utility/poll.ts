// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class PollCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'poll',
      description: 'Create a poll with reactions',
      category: 'utility',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: [],
      examples: ['/poll What should we eat today?', 'p!poll Best game?'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const question = interaction.options.getString('question');
    
    if (!question) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a question for the poll.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 📊 Poll`)
      .setColor(COLORS.info)
      .setDescription(question)
      .setFooter({ text: `Poll by ${interaction.user.username}` })
      .setTimestamp();

    const pollMessage = await interaction.reply({ embeds: [embed], fetchReply: true });

    await pollMessage.react('👍');
    await pollMessage.react('👎');
  }

  public async executePrefix(message: Message): Promise<void> {
    const _args = message.content.split(' ').slice(1);
    const question = _args.join(' ');

    if (!question) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a question for the poll.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 📊 Poll`)
      .setColor(COLORS.info)
      .setDescription(question)
      .setFooter({ text: `Poll by ${message.author.username}` })
      .setTimestamp();

    const pollMessage = await message.channel.send({ embeds: [embed] });

    await pollMessage.react('👍');
    await pollMessage.react('👎');
  }
}

export default PollCommand;
