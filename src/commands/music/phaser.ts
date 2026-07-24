import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class PhaserCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'phaser',
      description: 'Apply phaser filter',
      category: 'music',
      cooldown: 3,
      userPermissions: [PermissionFlagsBits.Connect],
      botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['phase'],
      examples: ['/phaser', 'p!phaser'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guild || !interaction.member) return;

    const voiceChannel = (interaction.member as any).voice.channel;
    if (!voiceChannel) {
      await interaction.reply({ content: '❌ You need to be in a voice channel to apply phaser.', ephemeral: true });
      return;
    }

    try {
      const client = interaction.client as any;
      const musicManager = client.musicManager;

      if (!musicManager) {
        await interaction.reply({ content: '❌ Music system is not available.', ephemeral: true });
        return;
      }

      const player = musicManager.get(interaction.guild.id);

      if (!player) {
        await interaction.reply({ content: '❌ Nothing is currently playing.', ephemeral: true });
        return;
      }

      if (player.voiceChannel !== voiceChannel.id) {
        await interaction.reply({ content: '❌ You need to be in the same voice channel as the bot.', ephemeral: true });
        return;
      }

      await musicManager.setFilter(interaction.guild.id, 'phaser');

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Phaser Applied`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Applied by', value: interaction.user.tag, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to apply phaser.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message): Promise<void> {
    if (!message.guild || !message.member) return;

    const voiceChannel = (message.member as any).voice.channel;
    if (!voiceChannel) {
      await message.reply('❌ You need to be in a voice channel to apply phaser.');
      return;
    }

    try {
      const client = message.client as any;
      const musicManager = client.musicManager;

      if (!musicManager) {
        await message.reply('❌ Music system is not available.');
        return;
      }

      const player = musicManager.get(message.guild.id);

      if (!player) {
        await message.reply('❌ Nothing is currently playing.');
        return;
      }

      if (player.voiceChannel !== voiceChannel.id) {
        await message.reply('❌ You need to be in the same voice channel as the bot.');
        return;
      }

      await musicManager.setFilter(message.guild.id, 'phaser');

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} Phaser Applied`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Applied by', value: message.author.tag, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to apply phaser.');
    }
  }
}

export default PhaserCommand;
