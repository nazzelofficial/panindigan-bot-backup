import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class SetBalanceCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'setbalance',
      description: 'Set a user\'s balance (Admin only)',
      category: 'economy',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.ManageGuild],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['setbal', 'setmoney'],
      examples: ['/setbalance @user 1000', 'p!setbalance @user 1000'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const targetUser = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    if (!targetUser) {
      await interaction.reply({ content: '❌ Please provide a user.', ephemeral: true });
      return;
    }

    if (amount === null || amount < 0) {
      await interaction.reply({ content: '❌ Please provide a valid amount.', ephemeral: true });
      return;
    }

    if (!interaction.guildId) return;

    try {
      const prisma = getPrismaClient();
      const guild = await prisma.guild.upsert({
        where: { guildId: interaction.guildId },
        update: {},
        create: { guildId: interaction.guildId },
      });

      await prisma.economy.upsert({
        where: { userId_guildId: { userId: targetUser.id, guildId: interaction.guildId } },
        update: { wallet: amount },
        create: { userId: targetUser.id, guildId: interaction.guildId, wallet: amount, bank: 0 },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Balance Set`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'User', value: targetUser.tag, inline: true },
          { name: 'New Balance', value: `${amount} ${guild.currencySymbol || '💰'}`, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to set balance.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const targetUser = message.mentions.users.first();
    const amount = parseInt(args[1]);

    if (!targetUser) {
      await message.reply('❌ Please provide a user.');
      return;
    }

    if (isNaN(amount) || amount < 0) {
      await message.reply('❌ Please provide a valid amount.');
      return;
    }

    if (!message.guildId) return;

    try {
      const prisma = getPrismaClient();
      const guild = await prisma.guild.upsert({
        where: { guildId: message.guildId },
        update: {},
        create: { guildId: message.guildId },
      });

      await prisma.economy.upsert({
        where: { userId_guildId: { userId: targetUser.id, guildId: message.guildId } },
        update: { wallet: amount },
        create: { userId: targetUser.id, guildId: message.guildId, wallet: amount, bank: 0 },
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Balance Set`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'User', value: targetUser.tag, inline: true },
          { name: 'New Balance', value: `${amount} ${guild.currencySymbol || '💰'}`, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to set balance.');
    }
  }
}

export default SetBalanceCommand;
