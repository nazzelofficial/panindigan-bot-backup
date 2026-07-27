// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class FilterCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'filter',
      description: 'Apply audio filters to the music',
      category: 'music',
      cooldown: 3,
      userPermissions: [PermissionFlagsBits.Connect],
      botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['audiofilter', 'fx'],
      examples: ['/filter bassboost', 'p!filter nightcore'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const filter = interaction.options.getString('filter') || 'off';

    if (!interaction.guild || !interaction.member) return;

    const voiceChannel = (interaction.member as any).voice.channel;
    if (!voiceChannel) {
      await interaction.reply({ content: '❌ You need to be in a voice channel to apply filters.', ephemeral: true });
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

      const validFilters = ['off', 'bassboost', 'nightcore', 'vaporwave', '8d', 'speed', 'slow', 'treble', 'normalizer'];
      if (!validFilters.includes(filter)) {
        await interaction.reply({ content: `❌ Invalid filter. Available filters: ${validFilters.join(', ')}`, ephemeral: true });
        return;
      }

      await player.setFilters(filter);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Filter Applied`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Filter', value: filter, inline: true },
          { name: 'Applied by', value: interaction.user.tag, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to apply filter.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const filter = args[0] || 'off';

    if (!message.guild || !message.member) return;

    const voiceChannel = (message.member as any).voice.channel;
    if (!voiceChannel) {
      await message.reply('❌ You need to be in a voice channel to apply filters.');
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

      const validFilters = ['off', 'bassboost', 'nightcore', 'vaporwave', '8d', 'speed', 'slow', 'treble', 'normalizer'];
      if (!validFilters.includes(filter)) {
        await message.reply(`❌ Invalid filter. Available filters: ${validFilters.join(', ')}`);
        return;
      }

      await player.setFilters(filter);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Filter Applied`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Filter', value: filter, inline: true },
          { name: 'Applied by', value: message.author.tag, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to apply filter.');
    }
  }
}

export default FilterCommand;
