// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class LyricsCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'lyrics',
      description: 'Get lyrics for the currently playing song',
      category: 'music',
      cooldown: 10,
      userPermissions: [PermissionFlagsBits.Connect],
      botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['words', 'songtext'],
      examples: ['/lyrics', 'p!lyrics'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild) return;

    try {
      const client = interaction.client as any;
      const musicManager = client.kazagumo;

      if (!musicManager) {
        await interaction.reply({ content: '❌ Music system is not available.', ephemeral: true });
        return;
      }

      const player = client.kazagumo!.players.get(interaction.guild.id);

      if (!player || !player.currentTrack) {
        await interaction.reply({ content: '❌ Nothing is currently playing.', ephemeral: true });
        return;
      }

      const track = player.currentTrack;
      const lyrics = null // lyrics not available via player;

      if (!lyrics) {
        await interaction.reply({ content: '❌ No lyrics found for this song.', ephemeral: true });
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Lyrics - ${track.title}`)
        .setColor(COLORS.info)
        .setDescription(lyrics.substring(0, 4096))
        .setFooter({ text: 'Lyrics provided by third-party service' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to fetch lyrics.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const query = _args.join(' ');

    if (!message.guild) return;

    try {
      const client = message.client as any;
      const musicManager = client.kazagumo;

      if (!musicManager) {
        await message.reply('❌ Music system is not available.');
        return;
      }

      let track;
      if (query) {
        track = { title: query, artist: '' };
      } else {
        const player = client.kazagumo!.players.get(message.guild.id);
        if (!player || !player.currentTrack) {
          await message.reply('❌ Nothing is currently playing.');
          return;
        }
        track = player.currentTrack;
      }

      const lyrics = null // lyrics not available via player;

      if (!lyrics) {
        await message.reply('❌ No lyrics found for this song.');
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Lyrics - ${track.title}`)
        .setColor(COLORS.info)
        .setDescription(lyrics.substring(0, 4096))
        .setFooter({ text: 'Lyrics provided by third-party service' })
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to fetch lyrics.');
    }
  }
}

export default LyricsCommand;
