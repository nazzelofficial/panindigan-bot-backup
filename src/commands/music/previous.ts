import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class PreviousCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'previous',
      description: 'Play the previous song',
      category: 'music',
      cooldown: 3,
      userPermissions: [PermissionFlagsBits.Connect],
      botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['prev', 'back'],
      examples: ['/previous', 'p!previous'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild || !interaction.member) return;

    const voiceChannel = (interaction.member as any).voice.channel;
    if (!voiceChannel) {
      await interaction.reply({ content: '❌ You need to be in a voice channel to play the previous song.', ephemeral: true });
      return;
    }

    try {
      const client = interaction.client as any;
      const musicManager = client.kazagumo;

      if (!musicManager) {
        await interaction.reply({ content: '❌ Music system is not available.', ephemeral: true });
        return;
      }

      const player = client.kazagumo!.players.get(interaction.guild.id);

      if (!player) {
        await interaction.reply({ content: '❌ Nothing is currently playing.', ephemeral: true });
        return;
      }

      if (player.voiceChannel !== voiceChannel.id) {
        await interaction.reply({ content: '❌ You need to be in the same voice channel as the bot.', ephemeral: true });
        return;
      }

      const previousTrack = await musicManager.previous(interaction.guild.id);

      if (!previousTrack) {
        await interaction.reply({ content: '❌ No previous song available.', ephemeral: true });
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Playing Previous`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Track', value: previousTrack.title, inline: true },
          { name: 'Requested by', value: interaction.user.tag, inline: true },
        ])
        .setThumbnail(previousTrack.thumbnail || null)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to play previous song.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message): Promise<void> {
    if (!message.guild || !message.member) return;

    const voiceChannel = (message.member as any).voice.channel;
    if (!voiceChannel) {
      await message.reply('❌ You need to be in a voice channel to play the previous song.');
      return;
    }

    try {
      const client = message.client as any;
      const musicManager = client.kazagumo;

      if (!musicManager) {
        await message.reply('❌ Music system is not available.');
        return;
      }

      const player = client.kazagumo!.players.get(message.guild.id);

      if (!player) {
        await message.reply('❌ Nothing is currently playing.');
        return;
      }

      if (player.voiceChannel !== voiceChannel.id) {
        await message.reply('❌ You need to be in the same voice channel as the bot.');
        return;
      }

      const previousTrack = await musicManager.previous(message.guild.id);

      if (!previousTrack) {
        await message.reply('❌ No previous song available.');
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Playing Previous`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Track', value: previousTrack.title, inline: true },
          { name: 'Requested by', value: message.author.tag, inline: true },
        ])
        .setThumbnail(previousTrack.thumbnail || null)
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to play previous song.');
    }
  }
}

export default PreviousCommand;
