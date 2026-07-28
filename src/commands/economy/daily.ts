// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { PALETTE, KIT, errorEmbed } from '../../utils/EmbedSystem.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
import config from '../../../config.json' with { type: 'json' };

const COOLDOWN_MS = 24 * 60 * 60 * 1000;

export class DailyCommand extends BaseCommand {
  constructor() {
    super({
      name: 'daily', description: 'Claim your daily ₱ Piso reward', category: 'economy',
      cooldown: 5, userPermissions: [], botPermissions: [], guildOnly: true,
      slashCommand: true, prefixCommand: true,
      aliases: ['dailies', 'dailyreward'], examples: ['/daily', 'p!daily'],
    });
  }

  private async run(userId: string, guildId: string, userObj: any): Promise<EmbedBuilder> {
    const prisma = getPrismaClient();

    const guild = await prisma.guild.upsert({
      where: { guildId }, update: {}, create: { guildId },
    });
    const symbol = guild?.currencySymbol ?? config.economy.currencySymbol ?? '₱';

    await prisma.user.upsert({
      where: { userId_guildId: { userId, guildId } },
      update: {}, create: { userId, guildId },
    }).catch(() => null);

    const economy = await prisma.economy.findUnique({
      where: { userId_guildId: { userId, guildId } },
    });

    const now = new Date();
    const lastDaily = economy?.lastDaily ? new Date(economy.lastDaily) : new Date(0);
    const elapsed   = now.getTime() - lastDaily.getTime();

    if (elapsed < COOLDOWN_MS) {
      const remaining = COOLDOWN_MS - elapsed;
      const h = Math.floor(remaining / 3_600_000);
      const m = Math.floor((remaining % 3_600_000) / 60_000);
      const expiresTs = Math.floor((now.getTime() + remaining) / 1000);
      return errorEmbed(
        'Already Claimed',
        `You already claimed your daily reward!\n\n⏰ Next claim: <t:${expiresTs}:R> (${h}h ${m}m)`,
      );
    }

    const dailyAmount = guild?.dailyAmount ?? config.economy?.defaultDailyAmount ?? 500;
    const streak      = (economy?.dailyStreak ?? 0) + 1;
    const bonus       = Math.floor(dailyAmount * Math.min(streak * 0.05, 0.5)); // up to 50% streak bonus
    const total       = dailyAmount + bonus;

    await prisma.economy.upsert({
      where: { userId_guildId: { userId, guildId } },
      update: { wallet: { increment: total }, lastDaily: now, dailyStreak: streak },
      create: { userId, guildId, wallet: total, bank: 0, lastDaily: now, dailyStreak: 1 },
    });

    return new EmbedBuilder()
      .setColor(PALETTE.economy)
      .setAuthor({ name: `${userObj.username} — Daily Reward`, iconURL: userObj.displayAvatarURL({ size: 64 }) })
      .setDescription(`${KIT.sparkle} Your daily reward has been added to your wallet!`)
      .addFields(
        { name: `${KIT.economy} Base Reward`,  value: `${symbol}${dailyAmount.toLocaleString()}`, inline: true },
        { name: `🔥 Streak Bonus`,             value: bonus > 0 ? `+${symbol}${bonus.toLocaleString()}` : 'None', inline: true },
        { name: `💰 Total Earned`,             value: `**${symbol}${total.toLocaleString()}**`,   inline: true },
        { name: `🗓️ Daily Streak`,             value: `**${streak}** day${streak !== 1 ? 's' : ''}`, inline: true },
        { name: `⏰ Next Claim`,               value: `<t:${Math.floor((now.getTime() + COOLDOWN_MS) / 1000)}:R>`, inline: true },
      )
      .setFooter({ text: 'Keep your streak going for bigger bonuses!' })
      .setTimestamp();
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();
    const embed = await this.run(interaction.user.id, interaction.guildId!, interaction.user);
    await interaction.editReply({ embeds: [embed] });
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const embed = await this.run(message.author.id, message.guildId!, message.author);
    await message.reply({ embeds: [embed] });
  }
}
export default DailyCommand;
