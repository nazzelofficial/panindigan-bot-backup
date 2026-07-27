// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class QuoteCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'quote',
      description: 'Quote a message',
      category: 'utility',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: [],
      examples: ['/quote messageid', 'p!quote messageid'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const messageId = interaction.options.getString('messageid');
    
    if (!messageId) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a message ID to quote.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    try {
      const quotedMessage = await interaction.channel?.messages.fetch(messageId);
      
      if (!quotedMessage) {
        const errorEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Error`)
          .setColor(COLORS.error)
          .setDescription('Could not find that message.')
          .setTimestamp();

        await interaction.reply({ embeds: [errorEmbed] });
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.info} 💬 Quote`)
        .setColor(COLORS.info)
        .setDescription(quotedMessage.content)
        .setAuthor({ name: quotedMessage.author.username, iconURL: quotedMessage.author.displayAvatarURL() })
        .setFooter({ text: `Quoted by ${interaction.user.username}` })
        .setTimestamp(quotedMessage.createdAt);

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Could not fetch that message. Make sure the message ID is correct.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
    }
  }

  public async executePrefix(message: Message): Promise<void> {
    const _args = message.content.split(' ').slice(1);
    const messageId = args[0];

    if (!messageId) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a message ID to quote.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    try {
      const quotedMessage = await message.channel.messages.fetch(messageId);
      
      if (!quotedMessage) {
        const errorEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Error`)
          .setColor(COLORS.error)
          .setDescription('Could not find that message.')
          .setTimestamp();

        await message.reply({ embeds: [errorEmbed] });
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.info} 💬 Quote`)
        .setColor(COLORS.info)
        .setDescription(quotedMessage.content)
        .setAuthor({ name: quotedMessage.author.username, iconURL: quotedMessage.author.displayAvatarURL() })
        .setFooter({ text: `Quoted by ${message.author.username}` })
        .setTimestamp(quotedMessage.createdAt);

      await message.reply({ embeds: [embed] });
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Could not fetch that message. Make sure the message ID is correct.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
    }
  }
}

export default QuoteCommand;
