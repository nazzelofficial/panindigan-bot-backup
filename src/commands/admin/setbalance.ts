import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';
import { Formatter } from '../../utils/Formatter';

export class SetBalanceCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'setbalance',
      description: 'Set a user\'s balance (wallet or bank)',
      category: 'admin',
      cooldown: 3,
      userPermissions: [PermissionFlagsBits.Administrator],
      botPermissions: [PermissionFlagsBits.ManageGuild],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['setmoney', 'setcash'],
      examples: ['/setbalance @user 1000 wallet', 'p!setbalance @user 5000 bank'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');
    const type = interaction.options.getString('type') || 'wallet';

    if (!user) {
      await interaction.reply({ content: '❌ Please provide a user.', ephemeral: true });
      return;
    }

    if (amount === null || amount < 0) {
      await interaction.reply({ content: '❌ Please provide a valid amount (0 or greater).', ephemeral: true });
      return;
    }

    if (!['wallet', 'bank'].includes(type)) {
      await interaction.reply({ content: '❌ Type must be either "wallet" or "bank".', ephemeral: true });
      return;
    }

    if (!interaction.guild) return;

    const prisma = getPrismaClient();
    const updateData: any = {};
    if (type === 'wallet') {
      updateData.walletBalance = amount;
    } else {
      updateData.bankBalance = amount;
    }

    await prisma.user.upsert({
      where: { userId_guildId: { userId: user.id, guildId: interaction.guild.id } },
      update: updateData,
      create: { userId: user.id, guildId: interaction.guild.id, ...updateData },
    });

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.success} Balance Set`)
      .setColor(COLORS.success)
      .addFields([
        { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
        { name: 'Type', value: type, inline: true },
        { name: 'Amount', value: Formatter.formatCurrency(amount), inline: true },
        { name: 'Updated by', value: interaction.user.tag, inline: false },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const user = message.mentions.users.first();
    const amount = parseInt(args[1]);
    const type = args[2]?.toLowerCase() || 'wallet';

    if (!user) {
      await message.reply('❌ Please mention a user.');
      return;
    }

    if (isNaN(amount) || amount < 0) {
      await message.reply('❌ Please provide a valid amount (0 or greater).');
      return;
    }

    if (!['wallet', 'bank'].includes(type)) {
      await message.reply('❌ Type must be either "wallet" or "bank".');
      return;
    }

    if (!message.guild) return;

    const prisma = getPrismaClient();
    const updateData: any = {};
    if (type === 'wallet') {
      updateData.walletBalance = amount;
    } else {
      updateData.bankBalance = amount;
    }

    await prisma.user.upsert({
      where: { userId_guildId: { userId: user.id, guildId: message.guild.id } },
      update: updateData,
      create: { userId: user.id, guildId: message.guild.id, ...updateData },
    });

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.success} Balance Set`)
      .setColor(COLORS.success)
      .addFields([
        { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
        { name: 'Type', value: type, inline: true },
        { name: 'Amount', value: Formatter.formatCurrency(amount), inline: true },
        { name: 'Updated by', value: message.author.tag, inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default SetBalanceCommand;
