// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
import { calculateLevelFromXP } from '../../handlers/LevelingHandler.js';

export class XpSetCommand extends BaseCommand {
  constructor() {
    super({
      name: 'xpset',
      description: 'Set exact XP amount for a user (Mod only)',
      category: 'leveling',
      premiumTier: 'bronze',
      cooldown: 5,
      ownerOnly: false,
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      userPermissions: [PermissionFlagsBits.ManageGuild],
      aliases: [],
      examples: ['p!xpset @user 1000', '/xpset @user 1000'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addUserOption(o => o.setName('user').setDescription('Target user').setRequired(true))
      .addIntegerOption(o => o.setName('amount').setDescription('XP amount to set').setRequired(true).setMinValue(0))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  private async setXP(userId: string, guildId: string, xp: number) {
    const prisma = getPrismaClient();
    const level = calculateLevelFromXP(xp);
    await prisma.leveling.upsert({
      where: { userId_guildId: { userId, guildId } },
      create: { userId, guildId, xp, level, totalXpEarned: xp },
      update: { xp, level },
    });
    return { xp, level };
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const target = i.options.getUser('user', true);
    const amount = i.options.getInteger('amount', true);
    try {
      const { xp, level } = await this.setXP(target.id, i.guildId!, amount);
      const embed = new EmbedBuilder()
        .setColor(COLORS.success)
        .setTitle(`${EMOJIS.success} XP Set`)
        .setDescription(`Set **${target.username}**'s XP to **${xp}** (Level **${level}**).`)
        .setTimestamp();
      await i.reply({ embeds: [embed], ephemeral: true });
    } catch {
      await i.reply({ content: `${EMOJIS.error} Failed to set XP.`, ephemeral: true });
    }
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    const target = m.mentions.users.first();
    const amount = parseInt(args[1]);
    if (!target) { await m.reply(`${EMOJIS.error} Please mention a user. Usage: \`p!xpset @user <amount>\``); return; }
    if (isNaN(amount) || amount < 0) { await m.reply(`${EMOJIS.error} Please provide a valid XP amount (0+).`); return; }
    if (!m.member?.permissions.has(PermissionFlagsBits.ManageGuild)) {
      await m.reply(`${EMOJIS.error} You need **Manage Server** permission.`);
      return;
    }
    try {
      const { xp, level } = await this.setXP(target.id, m.guildId!, amount);
      const embed = new EmbedBuilder()
        .setColor(COLORS.success)
        .setTitle(`${EMOJIS.success} XP Set`)
        .setDescription(`Set **${target.username}**'s XP to **${xp}** (Level **${level}**).`)
        .setTimestamp();
      await m.reply({ embeds: [embed] });
    } catch {
      await m.reply(`${EMOJIS.error} Failed to set XP.`);
    }
  }
}
export default XpSetCommand;
