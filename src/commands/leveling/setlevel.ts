// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class SetLevelCommand extends BaseCommand {
  constructor() {
    super({ name: 'setlevel', description: 'Set a user\'s level directly (Admin)', category: 'leveling', premiumTier: 'free', cooldown: 3, guildOnly: true, slashCommand: true, prefixCommand: true, userPermissions: [PermissionFlagsBits.ManageGuild], aliases: ['setlvl'], examples: ['/setlevel @user 50', 'p!setlevel @user 50'] } as CommandOptions);
  }
  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addUserOption(o => o.setName('user').setDescription('Target user').setRequired(true))
      .addIntegerOption(o => o.setName('level').setDescription('Level to set').setRequired(true).setMinValue(0).setMaxValue(500))
      .setDMPermission(false)) as SlashCommandBuilder;
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const target = i.options.getUser('user', true);
    const level = i.options.getInteger('level', true);
    const prisma = getPrismaClient();
    const xpForLevel = Math.floor(5 * Math.pow(level, 2) + 50 * level + 100);
    await prisma.leveling.upsert({ where: { userId_guildId: { userId: target.id, guildId: i.guildId! } }, create: { userId: target.id, guildId: i.guildId!, level, xp: 0, totalXp: xpForLevel }, update: { level, xp: 0, totalXp: xpForLevel } });
    await i.reply({ content: `✅ Set **${target.username}**'s level to **${level}**.`, ephemeral: true });
  }
  public async executePrefix(m: Message, args: string[]): Promise<void> {
    const target = m.mentions.users.first(); const level = parseInt(args[1]);
    if (!target || isNaN(level)) { await m.reply('❌ Usage: `p!setlevel @user <level>`'); return; }
    const prisma = getPrismaClient();
    const xpForLevel = Math.floor(5 * Math.pow(level, 2) + 50 * level + 100);
    await prisma.leveling.upsert({ where: { userId_guildId: { userId: target.id, guildId: m.guildId! } }, create: { userId: target.id, guildId: m.guildId!, level, xp: 0, totalXp: xpForLevel }, update: { level, xp: 0, totalXp: xpForLevel } });
    await m.reply(`✅ Set **${target.username}**'s level to **${level}**.`);
  }
}
export default SetLevelCommand;
