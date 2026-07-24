import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class ModLogCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'modlog',
      description: 'Set the moderation log channel',
      category: 'moderation',
      cooldown: 3,
      userPermissions: [PermissionFlagsBits.ManageGuild],
      botPermissions: [PermissionFlagsBits.ManageWebhooks],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['moderationlog', 'setmodlog'],
      examples: ['/modlog #mod-logs', 'p!modlog #mod-logs'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const channel = interaction.options.getChannel('channel');

    if (!interaction.guild) return;

    const prisma = getPrismaClient();

    if (channel) {
      if (channel.type !== ChannelType.GuildText) {
        await interaction.reply({ content: '❌ Please provide a text channel.', ephemeral: true });
        return;
      }

      await prisma.guild.update({
        where: { guildId: interaction.guild.id },
        data: { modLogChannelId: channel.id },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Mod Log Channel Set`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Channel', value: channel.toString(), inline: true },
          { name: 'Moderator', value: interaction.user.tag, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } else {
      await prisma.guild.update({
        where: { guildId: interaction.guild.id },
        data: { modLogChannelId: null },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Mod Log Channel Disabled`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Status', value: 'Disabled', inline: true },
          { name: 'Moderator', value: interaction.user.tag, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const channel = message.mentions.channels.first();

    if (!message.guild) return;

    const prisma = getPrismaClient();

    if (channel) {
      if (channel.type !== ChannelType.GuildText) {
        await message.reply('❌ Please provide a text channel.');
        return;
      }

      await prisma.guild.update({
        where: { guildId: message.guild.id },
        data: { modLogChannelId: channel.id },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Mod Log Channel Set`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Channel', value: channel.toString(), inline: true },
          { name: 'Moderator', value: message.author.tag, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } else {
      await prisma.guild.update({
        where: { guildId: message.guild.id },
        data: { modLogChannelId: null },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Mod Log Channel Disabled`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Status', value: 'Disabled', inline: true },
          { name: 'Moderator', value: message.author.tag, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    }
  }
}

export default ModLogCommand;
