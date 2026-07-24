import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class SetLevelUpChannelCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'setlevelupchannel',
      description: 'Set the channel where level up messages are sent',
      category: 'admin',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.ManageGuild],
      botPermissions: [PermissionFlagsBits.ManageChannels],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['levelupchannel', 'setlevelup'],
      examples: ['/setlevelupchannel #level-ups', 'p!setlevelupchannel #level-ups'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const channel = interaction.options.getChannel('channel');

    if (!channel) {
      await interaction.reply({ content: '❌ Please provide a channel for level up messages.', ephemeral: true });
      return;
    }

    if (!interaction.guild) return;

    const prisma = getPrismaClient();
    await prisma.guild.update({
      where: { guildId: interaction.guild.id },
      data: { levelUpChannelId: channel.id },
    });

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.success} Level Up Channel Set`)
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
      await message.reply('❌ Please mention a channel for level up messages.');
      return;
    }

    if (!message.guild) return;

    const prisma = getPrismaClient();
    await prisma.guild.update({
      where: { guildId: message.guild.id },
      data: { levelUpChannelId: channel.id },
    });

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.success} Level Up Channel Set`)
      .setColor(COLORS.success)
      .addFields([
        { name: 'Channel', value: channel.toString(), inline: true },
        { name: 'Updated by', value: message.author.tag, inline: true },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default SetLevelUpChannelCommand;
