// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

const REP_COOLDOWN_HOURS = 24;

export class RepCommand extends BaseCommand {
  constructor() {
    super({ name: 'rep', description: 'Give reputation points to a user ⭐', category: 'social', premiumTier: 'silver', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, aliases: ['reputation', 'vouch'], examples: ['/rep @user', 'p!rep @user'] } as CommandOptions);
  }
  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description).addUserOption(o => o.setName('user').setDescription('Who to rep').setRequired(true)).setDMPermission(false)) as SlashCommandBuilder;
  }
  private async giveRep(giverId: string, targetId: string, guildId: string): Promise<{ success: boolean; error?: string; newTotal?: number }> {
    if (giverId === targetId) return { success: false, error: 'You cannot rep yourself!' };
    const prisma = getPrismaClient();
    const giver = await prisma.user.findUnique({ where: { userId_guildId: { userId: giverId, guildId } }, select: { lastRepGiven: true } });
    if (giver?.lastRepGiven) {
      const elapsed = (Date.now() - new Date(giver.lastRepGiven).getTime()) / 3600000;
      if (elapsed < REP_COOLDOWN_HOURS) {
        const remaining = Math.ceil(REP_COOLDOWN_HOURS - elapsed);
        return { success: false, error: `You can rep again in ${remaining} hour${remaining !== 1 ? 's' : ''}.` };
      }
    }
    const [updated] = await Promise.all([
      prisma.user.upsert({ where: { userId_guildId: { userId: targetId, guildId } }, create: { userId: targetId, guildId, repPoints: 1 }, update: { repPoints: { increment: 1 } } }),
      prisma.user.upsert({ where: { userId_guildId: { userId: giverId, guildId } }, create: { userId: giverId, guildId, lastRepGiven: new Date() }, update: { lastRepGiven: new Date() } }),
    ]);
    return { success: true, newTotal: updated.repPoints };
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const t = i.options.getUser('user', true);
    const result = await this.giveRep(i.user.id, t.id, i.guildId!);
    if (!result.success) { await i.reply({ content: `❌ ${result.error}`, ephemeral: true }); return; }
    const embed = new EmbedBuilder().setDescription(`⭐ **${i.user.username}** gave a reputation point to **${t.username}**!\n${t.username} now has **${result.newTotal}** rep points.`).setColor(COLORS.gold);
    await i.reply({ embeds: [embed] });
  }
  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    const t = m.mentions.users.first(); if (!t) { await m.reply('❌ Mention who to give rep!'); return; }
    const result = await this.giveRep(m.author.id, t.id, m.guildId!);
    if (!result.success) { await m.reply(`❌ ${result.error}`); return; }
    await m.reply(`⭐ Gave rep to **${t.username}**! They now have **${result.newTotal}** rep.`);
  }
}
export default RepCommand;
