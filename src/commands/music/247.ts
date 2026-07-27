// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class TwentyFourSevenCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: '247',
      description: 'Toggle 24/7 mode (bot stays in voice channel)',
      category: 'music',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.ManageGuild],
      botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['stay', 'alwayson'],
      examples: ['/247', 'p!247'],
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

      if (!player) {
        await interaction.reply({ content: '❌ Nothing is currently playing.', ephemeral: true });
        return;
      }

      const newState = player.data.set("247", !player.data.get("247"));

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} 24/7 Mode ${newState ? 'Enabled' : 'Disabled'}`)
        .setColor(newState ? COLORS.success : COLORS.warning)
        .addFields([
          { name: 'Status', value: newState ? '🔊 Enabled' : '🔇 Disabled', inline: true },
          { name: 'Toggled by', value: interaction.user.tag, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to toggle 24/7 mode.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message): Promise<void> {
    if (!message.guild) return;

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

      const newState = player.data.set("247", !player.data.get("247"));

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.music} 24/7 Mode ${newState ? 'Enabled' : 'Disabled'}`)
        .setColor(newState ? COLORS.success : COLORS.warning)
        .addFields([
          { name: 'Status', value: newState ? '🔊 Enabled' : '🔇 Disabled', inline: true },
          { name: 'Toggled by', value: message.author.tag, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to toggle 24/7 mode.');
    }
  }
}

export default TwentyFourSevenCommand;
