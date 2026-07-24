import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class RadioCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'radio',
      description: 'Play a radio station',
      category: 'music',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['fm', 'stream'],
      examples: ['/radio lofi', 'p!radio jazz'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const station = interaction.options.getString('station') || 'lofi';

    if (!interaction.member || !interaction.guild) return;

    const voiceChannel = (interaction.member as any).voice.channel;
    if (!voiceChannel) {
      await interaction.reply({ content: '❌ You need to be in a voice channel to play radio.', ephemeral: true });
      return;
    }

    try {
      await interaction.deferReply();

      const client = interaction.client as any;
      const musicManager = client.musicManager;

      if (!musicManager) {
        await interaction.editReply({ content: '❌ Music system is not available.' });
        return;
      }

      const player = musicManager.get(interaction.guild.id);

      if (player && player.voiceChannel !== voiceChannel.id) {
        await interaction.editReply({ content: '❌ I\'m already in another voice channel.' });
        return;
      }

      const radioStations: Record<string, string> = {
        lofi: 'https://stream.zeno.fm/0r0xa792kwzuv',
        jazz: 'https://stream.zeno.fm/f3wvbbqmdg8uv',
        classical: 'https://stream.zeno.fm/s45q6882kwzuv',
        pop: 'https://stream.zeno.fm/yn0v792kwzuv',
        rock: 'https://stream.zeno.fm/3r0xa792kwzuv',
        electronic: 'https://stream.zeno.fm/5r0xa792kwzuv',
      };

      const stationUrl = radioStations[station.toLowerCase()];
      if (!stationUrl) {
        await interaction.editReply({ content: '❌ Unknown station. Available: lofi, jazz, classical, pop, rock, electronic' });
        return;
      }

      if (!player) {
        await musicManager.create(interaction.guild.id, voiceChannel.id, interaction.channel.id);
      }

      await musicManager.playRadio(interaction.guild.id, stationUrl, station);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Radio Playing`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Station', value: station, inline: true },
          { name: 'Requested by', value: interaction.user.tag, inline: true },
        ])
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await interaction.editReply({ content: '❌ Failed to play radio.' });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const station = args[0] || 'lofi';

    if (!message.member || !message.guild) return;

    const voiceChannel = (message.member as any).voice.channel;
    if (!voiceChannel) {
      await message.reply('❌ You need to be in a voice channel to play radio.');
      return;
    }

    try {
      await message.reply('📻 Tuning in...');

      const client = message.client as any;
      const musicManager = client.musicManager;

      if (!musicManager) {
        await message.edit('❌ Music system is not available.');
        return;
      }

      const player = musicManager.get(message.guild.id);

      if (player && player.voiceChannel !== voiceChannel.id) {
        await message.edit('❌ I\'m already in another voice channel.');
        return;
      }

      const radioStations: Record<string, string> = {
        lofi: 'https://stream.zeno.fm/0r0xa792kwzuv',
        jazz: 'https://stream.zeno.fm/f3wvbbqmdg8uv',
        classical: 'https://stream.zeno.fm/s45q6882kwzuv',
        pop: 'https://stream.zeno.fm/yn0v792kwzuv',
        rock: 'https://stream.zeno.fm/3r0xa792kwzuv',
        electronic: 'https://stream.zeno.fm/5r0xa792kwzuv',
      };

      const stationUrl = radioStations[station.toLowerCase()];
      if (!stationUrl) {
        await message.edit('❌ Unknown station. Available: lofi, jazz, classical, pop, rock, electronic');
        return;
      }

      if (!player) {
        await musicManager.create(message.guild.id, voiceChannel.id, message.channel.id);
      }

      await musicManager.playRadio(message.guild.id, stationUrl, station);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Radio Playing`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Station', value: station, inline: true },
          { name: 'Requested by', value: message.author.tag, inline: true },
        ])
        .setTimestamp();

      await message.edit({ embeds: [embed] });
    } catch (error) {
      await message.edit('❌ Failed to play radio.');
    }
  }
}

export default RadioCommand;
