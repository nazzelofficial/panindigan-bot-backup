import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class SetGiveawayChannelCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'setgiveawaychannel',
      description: 'Set the channel for giveaways',
      category: 'admin',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.ManageGuild],
      botPermissions: [PermissionFlagsBits.ManageChannels],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['giveawaychannel', 'setgiveaways'],
      examples: ['/setgiveawaychannel #giveaways', 'p!setgiveawaychannel #giveaways'],
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
      data: { giveawayChannelId: channel.id },
    });

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.success} Giveaway Channel Set`)
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
      data: { giveawayChannelId: channel.id },
    });

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.success} Giveaway Channel Set`)
      .setColor(COLORS.success)
      .addFields([
        { name: 'Channel', value: channel.toString(), inline: true },
        { name: 'Updated by', value: message.author.tag, inline: true },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default SetGiveawayChannelCommand;
