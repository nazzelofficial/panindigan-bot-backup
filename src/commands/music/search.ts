import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class SearchCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'search',
      description: 'Search for songs and add them to the queue',
      category: 'music',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['find', 'ytsearch'],
      examples: ['/search song name', 'p!search song name'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const query = interaction.options.getString('query');

    if (!query) {
      await interaction.reply({ content: '❌ Please provide a search query.', ephemeral: true });
      return;
    }

    if (!interaction.member || !interaction.guild) return;

    const voiceChannel = (interaction.member as any).voice.channel;
    if (!voiceChannel) {
      await interaction.reply({ content: '❌ You need to be in a voice channel to search for songs.', ephemeral: true });
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

      const results = await musicManager.search(query, 10);

      if (!results || results.length === 0) {
        await interaction.editReply({ content: '❌ No results found for that query.' });
        return;
      }

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('music_search_select')
        .setPlaceholder('Select a song to play')
        .addOptions(
          results.slice(0, 10).map((track: any, index: number) => ({
            label: `${index + 1}. ${track.title.substring(0, 80)}`,
            description: track.duration || 'Unknown duration',
            value: index.toString(),
          }))
        );

      const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Search Results`)
        .setColor(COLORS.info)
        .setDescription(`Results for: ${query}`)
        .addFields(
          results.slice(0, 5).map((track: any, index: number) => ({
            name: `${index + 1}. ${track.title}`,
            value: track.duration || 'Unknown',
            inline: false,
          }))
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed], components: [row] });

      const collector = interaction.channel?.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        time: 60000,
      });

      collector?.on('collect', async (i) => {
        if (i.user.id !== interaction.user.id) {
          await i.reply({ content: '❌ This menu is not for you.', ephemeral: true });
          return;
        }

        const selectedIndex = parseInt(i.values[0]);
        const selectedTrack = results[selectedIndex];

        const player = musicManager.get(interaction.guild.id);
        if (!player) {
          await musicManager.create(interaction.guild.id, voiceChannel.id, interaction.channel.id);
        }

        await musicManager.play(interaction.guild.id, selectedTrack);

        const playEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.success} Playing`)
          .setColor(COLORS.success)
          .addFields([
            { name: 'Track', value: selectedTrack.title, inline: true },
            { name: 'Duration', value: selectedTrack.duration || 'Unknown', inline: true },
          ])
          .setThumbnail(selectedTrack.thumbnail || null)
          .setTimestamp();

        await i.update({ embeds: [playEmbed], components: [] });
        collector.stop();
      });

      collector?.on('end', async (collected) => {
        if (collected.size === 0) {
          await interaction.editReply({ components: [] });
        }
      });
    } catch (error) {
      await interaction.editReply({ content: '❌ Failed to search for songs.' });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const query = args.join(' ');

    if (!query) {
      await message.reply('❌ Please provide a search query.');
      return;
    }

    if (!message.member || !message.guild) return;

    const voiceChannel = (message.member as any).voice.channel;
    if (!voiceChannel) {
      await message.reply('❌ You need to be in a voice channel to search for songs.');
      return;
    }

    try {
      await message.reply('🔍 Searching...');

      const client = message.client as any;
      const musicManager = client.musicManager;

      if (!musicManager) {
        await message.edit('❌ Music system is not available.');
        return;
      }

      const results = await musicManager.search(query, 10);

      if (!results || results.length === 0) {
        await message.edit('❌ No results found for that query.');
        return;
      }

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('music_search_select')
        .setPlaceholder('Select a song to play')
        .addOptions(
          results.slice(0, 10).map((track: any, index: number) => ({
            label: `${index + 1}. ${track.title.substring(0, 80)}`,
            description: track.duration || 'Unknown duration',
            value: index.toString(),
          }))
        );

      const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Search Results`)
        .setColor(COLORS.info)
        .setDescription(`Results for: ${query}`)
        .addFields(
          results.slice(0, 5).map((track: any, index: number) => ({
            name: `${index + 1}. ${track.title}`,
            value: track.duration || 'Unknown',
            inline: false,
          }))
        )
        .setTimestamp();

      await message.edit({ embeds: [embed], components: [row] });

      const collector = message.channel.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        time: 60000,
      });

      collector.on('collect', async (i) => {
        if (i.user.id !== message.author.id) {
          await i.reply({ content: '❌ This menu is not for you.', ephemeral: true });
          return;
        }

        const selectedIndex = parseInt(i.values[0]);
        const selectedTrack = results[selectedIndex];

        const player = musicManager.get(message.guild.id);
        if (!player) {
          await musicManager.create(message.guild.id, voiceChannel.id, message.channel.id);
        }

        await musicManager.play(message.guild.id, selectedTrack);

        const playEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.success} Playing`)
          .setColor(COLORS.success)
          .addFields([
            { name: 'Track', value: selectedTrack.title, inline: true },
            { name: 'Duration', value: selectedTrack.duration || 'Unknown', inline: true },
          ])
          .setThumbnail(selectedTrack.thumbnail || null)
          .setTimestamp();

        await i.update({ embeds: [playEmbed], components: [] });
        collector.stop();
      });

      collector.on('end', async (collected) => {
        if (collected.size === 0) {
          await message.edit({ components: [] });
        }
      });
    } catch (error) {
      await message.edit('❌ Failed to search for songs.');
    }
  }
}

export default SearchCommand;
