import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class ProfileCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'profile',
      description: 'View your economy profile',
      category: 'economy',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['econprofile', 'stats'],
      examples: ['/profile', '/profile @user', 'p!profile'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const targetUser = interaction.options.getUser('user') || interaction.user;

    if (!interaction.guildId) return;

    try {
      const prisma = getPrismaClient();
      const guild = await prisma.guild.upsert({
        where: { guildId: interaction.guildId },
        update: {},
        create: { guildId: interaction.guildId },
      });

      const economy = await prisma.economy.findUnique({
        where: { userId_guildId: { userId: targetUser.id, guildId: interaction.guildId } },
      });

      const wallet = economy?.wallet || 0;
      const bank = economy?.bank || 0;
      const total = wallet + bank;

      const inventory = await prisma.inventory.findMany({
        where: { userId: targetUser.id },
        include: { item: true },
      });

      const totalItems = inventory.reduce((sum, inv) => sum + inv.quantity, 0);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} ${targetUser.tag}'s Profile`)
        .setColor(COLORS.info)
        .setThumbnail(targetUser.displayAvatarURL())
        .addFields([
          { name: 'Wallet', value: `${wallet.toLocaleString()} ${guild.currencySymbol || '💰'}`, inline: true },
          { name: 'Bank', value: `${bank.toLocaleString()} ${guild.currencySymbol || '💰'}`, inline: true },
          { name: 'Total', value: `${total.toLocaleString()} ${guild.currencySymbol || '💰'}`, inline: true },
          { name: 'Inventory Items', value: totalItems.toString(), inline: true },
          { name: 'Daily Streak', value: (economy?.dailyStreak || 0).toString(), inline: true },
          { name: 'Weekly Streak', value: (economy?.weeklyStreak || 0).toString(), inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to fetch profile.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const targetUser = message.mentions.users.first() || message.author;

    if (!message.guildId) return;

    try {
      const prisma = getPrismaClient();
      const guild = await prisma.guild.upsert({
        where: { guildId: message.guildId },
        update: {},
        create: { guildId: message.guildId },
      });

      const economy = await prisma.economy.findUnique({
        where: { userId_guildId: { userId: targetUser.id, guildId: message.guildId } },
      });

      const wallet = economy?.wallet || 0;
      const bank = economy?.bank || 0;
      const total = wallet + bank;

      const inventory = await prisma.inventory.findMany({
        where: { userId: targetUser.id },
        include: { item: true },
      });

      const totalItems = inventory.reduce((sum, inv) => sum + inv.quantity, 0);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} ${targetUser.tag}'s Profile`)
        .setColor(COLORS.info)
        .setThumbnail(targetUser.displayAvatarURL())
        .addFields([
          { name: 'Wallet', value: `${wallet.toLocaleString()} ${guild.currencySymbol || '💰'}`, inline: true },
          { name: 'Bank', value: `${bank.toLocaleString()} ${guild.currencySymbol || '💰'}`, inline: true },
          { name: 'Total', value: `${total.toLocaleString()} ${guild.currencySymbol || '💰'}`, inline: true },
          { name: 'Inventory Items', value: totalItems.toString(), inline: true },
          { name: 'Daily Streak', value: (economy?.dailyStreak || 0).toString(), inline: true },
          { name: 'Weekly Streak', value: (economy?.weeklyStreak || 0).toString(), inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to fetch profile.');
    }
  }
}

export default ProfileCommand;
