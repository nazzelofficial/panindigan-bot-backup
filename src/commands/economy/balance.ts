// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import {
  ChatInputCommandInteraction,
  Message,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
import config from '../../../config.json' with { type: 'json' };

export class BalanceCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'balance',
      description: "Check your or another user's wallet and bank balance",
      category: 'economy',
      cooldown: 3,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['bal', 'money', 'cash', 'wallet'],
      examples: ['/balance', '/balance @user', 'p!balance', 'p!balance @user', 'p!bal'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addUserOption(opt =>
        opt.setName('user').setDescription('User to check balance of').setRequired(false)
      )
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  private async fetchBalance(userId: string, guildId: string) {
    const prisma = getPrismaClient();

    // Ensure user exists
    await prisma.user.upsert({
      where: { userId_guildId: { userId, guildId } },
      create: { userId, guildId },
      update: {},
    });

    const economy = await prisma.economy.upsert({
      where: { userId_guildId: { userId, guildId } },
      create: {
        userId,
        guildId,
        wallet: BigInt(config.economy.startingBalance),
        bank: BigInt(0),
      },
      update: {},
    });

    // Ensure guild exists for currency symbol
    await prisma.guild.upsert({
      where: { guildId },
      create: { guildId },
      update: {},
    });

    const guild = await prisma.guild.findUnique({ where: { guildId } });
    const symbol = guild?.currencySymbol || config.economy.currencySymbol;

    return { economy, symbol };
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getUser('user') || interaction.user;
    const guildId = interaction.guildId!;

    await interaction.deferReply();

    try {
      const { economy, symbol } = await this.fetchBalance(target.id, guildId);
      const wallet = Number(economy.wallet);
      const bank = Number(economy.bank);
      const total = wallet + bank;
      const networth = Number(economy.networth || 0);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} ${target.username}'s Balance`)
        .setColor(COLORS.info)
        .setThumbnail(target.displayAvatarURL({ size: 128 }))
        .addFields(
          { name: `👛 Wallet`, value: `${symbol}${wallet.toLocaleString()}`, inline: true },
          { name: `🏦 Bank`, value: `${symbol}${bank.toLocaleString()}`, inline: true },
          { name: `💰 Total`, value: `${symbol}${total.toLocaleString()}`, inline: false },
          { name: `📊 Net Worth`, value: `${symbol}${Math.max(total, networth).toLocaleString()}`, inline: true },
        )
        .setFooter({ text: `${config.economy.currencyName} • Panindigan Economy` })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Balance command error:', error);
      await interaction.editReply({ content: '❌ Failed to fetch balance.' });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const target = message.mentions.users.first() || message.author;
    const guildId = message.guildId!;

    try {
      const { economy, symbol } = await this.fetchBalance(target.id, guildId);
      const wallet = Number(economy.wallet);
      const bank = Number(economy.bank);
      const total = wallet + bank;

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} ${target.username}'s Balance`)
        .setColor(COLORS.info)
        .setThumbnail(target.displayAvatarURL({ size: 128 }))
        .addFields(
          { name: `👛 Wallet`, value: `${symbol}${wallet.toLocaleString()}`, inline: true },
          { name: `🏦 Bank`, value: `${symbol}${bank.toLocaleString()}`, inline: true },
          { name: `💰 Total`, value: `${symbol}${total.toLocaleString()}`, inline: false },
        )
        .setFooter({ text: `${config.economy.currencyName} • Panindigan Economy` })
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Balance command error:', error);
      await message.reply('❌ Failed to fetch balance.');
    }
  }
}

export default BalanceCommand;
