// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
import { calculateLevelFromXP } from '../../handlers/LevelingHandler.js';

export class XpGiveCommand extends BaseCommand {
  constructor() {
    super({
      name: 'xpgive',
      description: 'Give XP to a user (Mod only)',
      category: 'leveling',
      premiumTier: 'bronze',
      cooldown: 5,
      ownerOnly: false,
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      userPermissions: [PermissionFlagsBits.ManageGuild],
      aliases: ['givexp'],
      examples: ['p!xpgive @user 500', '/xpgive @user 500'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addUserOption(o => o.setName('user').setDescription('Target user').setRequired(true))
      .addIntegerOption(o => o.setName('amount').setDescription('Amount of XP to give').setRequired(true).setMinValue(1).setMaxValue(100000))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  private async giveXP(userId: string, guildId: string, amount: number) {
    const prisma = getPrismaClient();
    const existing = await prisma.leveling.findUnique({
      where: { userId_guildId: { userId, guildId } },
    });
    const currentXP = existing?.xp ?? 0;
    const newXP = currentXP + amount;
    const newLevel = calculateLevelFromXP(newXP);
    await prisma.leveling.upsert({
      where: { userId_guildId: { userId, guildId } },
      create: { userId, guildId, xp: newXP, level: newLevel, totalXpEarned: amount },
      update: { xp: newXP, level: newLevel, totalXpEarned: { increment: amount } },
    });
    return { newXP, newLevel, leveledUp: newLevel > (existing?.level ?? 0) };
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const target = i.options.getUser('user', true);
    const amount = i.options.getInteger('amount', true);
    try {
      const { newXP, newLevel, leveledUp } = await this.giveXP(target.id, i.guildId!, amount);
      const embed = new EmbedBuilder()
        .setColor(COLORS.success)
        .setTitle(`${EMOJIS.success} XP Given`)
        .setDescription(
          `Gave **${amount} XP** to **${target.username}**.\n` +
          `New total: **${newXP} XP** (Level **${newLevel}**)` +
          (leveledUp ? '\n🎉 They leveled up!' : '')
        )
        .setTimestamp();
      await i.reply({ embeds: [embed], ephemeral: true });
    } catch {
      await i.reply({ content: `${EMOJIS.error} Failed to give XP.`, ephemeral: true });
    }
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    const target = m.mentions.users.first();
    const amount = parseInt(args[1]);
    if (!target) { await m.reply(`${EMOJIS.error} Please mention a user. Usage: \`p!xpgive @user <amount>\``); return; }
    if (isNaN(amount) || amount < 1) { await m.reply(`${EMOJIS.error} Please provide a valid XP amount (1+).`); return; }
    if (!m.member?.permissions.has(PermissionFlagsBits.ManageGuild)) {
      await m.reply(`${EMOJIS.error} You need **Manage Server** permission.`);
      return;
    }
    try {
      const { newXP, newLevel, leveledUp } = await this.giveXP(target.id, m.guildId!, amount);
      const embed = new EmbedBuilder()
        .setColor(COLORS.success)
        .setTitle(`${EMOJIS.success} XP Given`)
        .setDescription(
          `Gave **${amount} XP** to **${target.username}**.\n` +
          `New total: **${newXP} XP** (Level **${newLevel}**)` +
          (leveledUp ? '\n🎉 They leveled up!' : '')
        )
        .setTimestamp();
      await m.reply({ embeds: [embed] });
    } catch {
      await m.reply(`${EMOJIS.error} Failed to give XP.`);
    }
  }
}
export default XpGiveCommand;
