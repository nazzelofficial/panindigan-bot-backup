// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PALETTE, KIT, errorEmbed, divider } from '../../utils/EmbedSystem.js';
import { Formatter } from '../../utils/Formatter.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
import config from '../../../config.json' with { type: 'json' };

export class BalanceCommand extends BaseCommand {
  constructor() {
    super({
      name: 'balance', description: "Check your or another user's balance", category: 'economy',
      cooldown: 3, userPermissions: [], botPermissions: [], guildOnly: true,
      slashCommand: true, prefixCommand: true,
      aliases: ['bal', 'money', 'cash', 'wallet'],
      examples: ['/balance', '/balance @user', 'p!balance', 'p!bal'],
    });
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name).setDescription(this.description).setDMPermission(false)
      .addUserOption(o => o.setName('user').setDescription('User to check balance of').setRequired(false)) as SlashCommandBuilder;
  }

  private async run(targetUser: any, guildId: string): Promise<EmbedBuilder> {
    const prisma = getPrismaClient();

    await prisma.user.upsert({
      where: { userId_guildId: { userId: targetUser.id, guildId } },
      update: {}, create: { userId: targetUser.id, guildId },
    }).catch(() => null);

    const guild = await prisma.guild.upsert({
      where: { guildId }, update: {}, create: { guildId },
    });
    const symbol = guild?.currencySymbol ?? config.economy?.currencySymbol ?? '₱';

    const economy = await prisma.economy.upsert({
      where: { userId_guildId: { userId: targetUser.id, guildId } },
      update: {},
      create: {
        userId: targetUser.id, guildId,
        wallet: BigInt(config.economy?.startingBalance ?? 0),
        bank: BigInt(0),
      },
    });

    const wallet = Number(economy.wallet ?? 0);
    const bank   = Number(economy.bank   ?? 0);
    const invest = Number(economy.investedAmount ?? 0);
    const total  = wallet + bank + invest;
    const maxBank = Number(economy.maxBank ?? guild?.maxBank ?? 100_000);

    const bankPct = maxBank > 0 ? Math.min(100, Math.floor((bank / maxBank) * 100)) : 0;
    const barFilled = Math.floor(bankPct / 10);
    const bar = '█'.repeat(barFilled) + '░'.repeat(10 - barFilled);

    return new EmbedBuilder()
      .setColor(PALETTE.economy)
      .setAuthor({ name: `${targetUser.username} — Balance`, iconURL: targetUser.displayAvatarURL({ size: 64 }) })
      .setThumbnail(targetUser.displayAvatarURL({ size: 128 }))
      .addFields(
        { name: `👛 Wallet`,    value: `**${symbol}${wallet.toLocaleString()}**`,        inline: true  },
        { name: `🏦 Bank`,      value: `**${symbol}${bank.toLocaleString()}**`,          inline: true  },
        { name: `📈 Invested`,  value: `**${symbol}${invest.toLocaleString()}**`,        inline: true  },
        { name: `${KIT.dot} Bank Storage`, value: `\`[${bar}]\` ${bankPct}% of ${symbol}${maxBank.toLocaleString()}`, inline: false },
        { name: `💰 Net Worth`, value: `**${symbol}${total.toLocaleString()}**`,         inline: true  },
      )
      .setFooter({ text: `Panindigan Economy  •  ${config.economy?.currencyName ?? 'Piso'}` })
      .setTimestamp();
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();
    try {
      const target = interaction.options.getUser('user') ?? interaction.user;
      await interaction.editReply({ embeds: [await this.run(target, interaction.guildId!)] });
    } catch {
      await interaction.editReply({ embeds: [errorEmbed('Error', 'Failed to fetch balance.')] });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    try {
      const target = message.mentions.users.first() ?? message.author;
      await message.reply({ embeds: [await this.run(target, message.guildId!)] });
    } catch {
      await message.reply({ embeds: [errorEmbed('Error', 'Failed to fetch balance.')] });
    }
  }
}
export default BalanceCommand;
