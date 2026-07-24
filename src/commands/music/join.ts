import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class JoinCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'join',
      description: 'Join the voice channel',
      category: 'music',
      cooldown: 3,
      userPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['connect', 'come'],
      examples: ['/join', 'p!join'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.member || !interaction.guild) return;

    const voiceChannel = (interaction.member as any).voice.channel;
    if (!voiceChannel) {
      await interaction.reply({ content: '❌ You need to be in a voice channel for me to join.', ephemeral: true });
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

      if (player && player.voiceChannel === voiceChannel.id) {
        await interaction.reply({ content: '❌ I\'m already in your voice channel.', ephemeral: true });
        return;
      }

      if (player && player.voiceChannel !== voiceChannel.id) {
        await interaction.reply({ content: '❌ I\'m already in another voice channel.', ephemeral: true });
        return;
      }

      await client.kazagumo.createPlayer({ guildId: interaction.guild.id, voiceId: voiceChannel.id, textId: interaction.channel.id, volume: 80, deaf: true });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Joined Voice Channel`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Channel', value: voiceChannel.name, inline: true },
          { name: 'Requested by', value: interaction.user.tag, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to join voice channel.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message): Promise<void> {
    if (!message.member || !message.guild) return;

    const voiceChannel = (message.member as any).voice.channel;
    if (!voiceChannel) {
      await message.reply('❌ You need to be in a voice channel for me to join.');
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

      if (player && player.voiceChannel === voiceChannel.id) {
        await message.reply('❌ I\'m already in your voice channel.');
        return;
      }

      if (player && player.voiceChannel !== voiceChannel.id) {
        await message.reply('❌ I\'m already in another voice channel.');
        return;
      }

      await client.kazagumo.createPlayer({ guildId: message.guild.id, voiceId: voiceChannel.id, textId: message.channel.id, volume: 80, deaf: true });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Joined Voice Channel`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Channel', value: voiceChannel.name, inline: true },
          { name: 'Requested by', value: message.author.tag, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to join voice channel.');
    }
  }
}

export default JoinCommand;
