import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, GuildEmoji } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { Formatter } from '../../utils/Formatter';

export class EmojiInfoCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'emojiinfo',
      description: 'Display information about an emoji',
      category: 'info',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['ei', 'emoji'],
      examples: ['/emojiinfo :emoji:', 'p!emojiinfo :emoji:'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const emoji = interaction.options.getString('emoji');
    if (!emoji) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide an emoji.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const parsedEmoji = this.parseEmoji(emoji);
    if (!parsedEmoji) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Invalid emoji.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Emoji Information`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Name', value: parsedEmoji.name || 'Unknown', inline: true },
        { name: 'ID', value: parsedEmoji.id || 'None', inline: true },
        { name: 'Animated', value: parsedEmoji.animated ? 'Yes' : 'No', inline: true },
        { name: 'URL', value: parsedEmoji.url || 'None', inline: false },
      ])
      .setTimestamp();

    if (parsedEmoji.url) {
      embed.setThumbnail(parsedEmoji.url);
    }

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const emoji = args[0];
    if (!emoji) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide an emoji.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const parsedEmoji = this.parseEmoji(emoji);
    if (!parsedEmoji) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Invalid emoji.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Emoji Information`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Name', value: parsedEmoji.name || 'Unknown', inline: true },
        { name: 'ID', value: parsedEmoji.id || 'None', inline: true },
        { name: 'Animated', value: parsedEmoji.animated ? 'Yes' : 'No', inline: true },
        { name: 'URL', value: parsedEmoji.url || 'None', inline: false },
      ])
      .setTimestamp();

    if (parsedEmoji.url) {
      embed.setThumbnail(parsedEmoji.url);
    }

    await message.reply({ embeds: [embed] });
  }

  private parseEmoji(emoji: string): { name: string | null; id: string | null; animated: boolean; url: string | null } | null {
    const customEmojiRegex = /<(a)?:([a-zA-Z0-9_]+):(\d+)>/;
    const match = emoji.match(customEmojiRegex);

    if (match) {
      const [, animated, name, id] = match;
      return {
        name,
        id,
        animated: animated === 'a',
        url: `https://cdn.discordapp.com/emojis/${id}.${animated ? 'gif' : 'png'}`,
      };
    }

    return {
      name: emoji,
      id: null,
      animated: false,
      url: null,
    };
  }
}

export default EmojiInfoCommand;
