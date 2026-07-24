import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class SetApplicationChannelCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'setapplicationchannel',
      description: 'Set the channel for application submissions',
      category: 'admin',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.ManageGuild],
      botPermissions: [PermissionFlagsBits.ManageChannels],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['applicationchannel', 'setapps'],
      examples: ['/setapplicationchannel #applications', 'p!setapplicationchannel #applications'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const channel = interaction.options.getChannel('channel');

    if (!channel) {
      await interaction.reply({ content: '❌ Please provide a channel.', ephemeral: true });
      return;
    }

    if (!interaction.guild) return;

    const prisma = getPrismaClient();
    await prisma.guild.update({
      where: { guildId: interaction.guild.id },
      data: { applicationChannelId: channel.id },
    });

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.success} Application Channel Set`)
      .setColor(COLORS.success)
      .addFields([
        { name: 'Channel', value: channel.toString(), inline: true },
        { name: 'Updated by', value: interaction.user.tag, inline: true },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const channel = message.mentions.channels.first();

    if (!channel) {
      await message.reply('❌ Please mention a channel.');
      return;
    }

    if (!message.guild) return;

    const prisma = getPrismaClient();
    await prisma.guild.update({
      where: { guildId: message.guild.id },
      data: { applicationChannelId: channel.id },
    });

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.success} Application Channel Set`)
      .setColor(COLORS.success)
      .addFields([
        { name: 'Channel', value: channel.toString(), inline: true },
        { name: 'Updated by', value: message.author.tag, inline: true },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default SetApplicationChannelCommand;
