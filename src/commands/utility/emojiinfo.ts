import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class EmojiInfoCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'emojiinfo',
      description: 'Display information about an emoji',
      category: 'utility',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['emoji'],
      examples: ['/emojiinfo :emoji:', 'p!emojiinfo :emoji:'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const emojiInput = interaction.options.getString('emoji');
    if (!emojiInput) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide an emoji.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const emoji = this.parseEmoji(emojiInput);
    if (!emoji) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .description('Invalid emoji format.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Emoji Information`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Name', value: emoji.name || 'Unknown', inline: true },
        { name: 'ID', value: emoji.id || 'N/A (Unicode)', inline: true },
        { name: 'Animated', value: emoji.animated ? 'Yes' : 'No', inline: true },
        { name: 'Format', value: emoji.id ? 'Custom' : 'Unicode', inline: true },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const emojiInput = args[0];

    if (!emojiInput) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide an emoji.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const emoji = this.parseEmoji(emojiInput);
    if (!emoji) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Invalid emoji format.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Emoji Information`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Name', value: emoji.name || 'Unknown', inline: true },
        { name: 'ID', value: emoji.id || 'N/A (Unicode)', inline: true },
        { name: 'Animated', value: emoji.animated ? 'Yes' : 'No', inline: true },
        { name: 'Format', value: emoji.id ? 'Custom' : 'Unicode', inline: true },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }

  private parseEmoji(emoji: string) {
    const customEmojiRegex = /<?(a)?:?(\w{2,32}):(\d{17,19})>?/;
    const match = emoji.match(customEmojiRegex);
    
    if (match) {
      return {
        animated: !!match[1],
        name: match[2],
        id: match[3],
      };
    }
    
    return {
      animated: false,
      name: emoji,
      id: null,
    };
  }
}

export default EmojiInfoCommand;
