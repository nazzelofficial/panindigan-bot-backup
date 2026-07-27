// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
import crypto from 'crypto';

const TIERS = ['bronze', 'silver', 'gold', 'diamond'];

export class KeygenCommand extends BaseCommand {
  constructor() {
    super({ name: 'keygen', description: 'Generate premium activation keys (Owner only)', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['generatekey', 'genkey'], examples: ['p!keygen gold 30', 'p!keygen diamond 365 5'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addStringOption(o => o.setName('tier').setDescription('Premium tier').setRequired(true).addChoices(...TIERS.map(t => ({ name: t, value: t }))))
      .addIntegerOption(o => o.setName('duration').setDescription('Duration in days').setRequired(true).setMinValue(1).setMaxValue(3650))
      .addIntegerOption(o => o.setName('count').setDescription('Number of keys to generate').setRequired(false).setMinValue(1).setMaxValue(50))) as SlashCommandBuilder;
  }

  private generateKey(tier: string, days: number): string {
    const prefix = tier.toUpperCase().slice(0, 3);
    const random = crypto.randomBytes(8).toString('hex').toUpperCase();
    return `${prefix}-${random.slice(0, 4)}-${random.slice(4, 8)}-${random.slice(8, 12)}-${days}D`;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const tier = i.options.getString('tier', true);
    const days = i.options.getInteger('duration', true);
    const count = i.options.getInteger('count') || 1;
    await i.deferReply({ ephemeral: true });

    const keys = await this.doGenerate(tier, days, count, i.user.id);
    const embed = new EmbedBuilder().setTitle('🔑 Premium Keys Generated').setColor(COLORS.gold)
      .addFields({ name: `${tier} (${days} days)`, value: keys.map(k => `\`${k}\``).join('\n'), inline: false })
      .setTimestamp();
    await i.editReply({ embeds: [embed] });
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    const [tier, daysStr, countStr] = _args;
    if (!TIERS.includes(tier)) { await m.reply(`❌ Invalid tier. Use: ${TIERS.join(', ')}`); return; }
    const days = parseInt(daysStr) || 30;
    const count = parseInt(countStr) || 1;
    const keys = await this.doGenerate(tier, days, Math.min(count, 50), m.author.id);
    const embed = new EmbedBuilder().setTitle('🔑 Premium Keys Generated').setColor(COLORS.gold)
      .addFields({ name: `${tier} (${days} days) × ${count}`, value: keys.map(k => `\`${k}\``).join('\n'), inline: false }).setTimestamp();
    await m.reply({ embeds: [embed] });
  }

  private async doGenerate(tier: string, days: number, count: number, createdBy: string): Promise<string[]> {
    const prisma = getPrismaClient();
    const keys: string[] = [];
    const expiresAt = new Date(Date.now() + days * 86400000);

    for (let n = 0; n < count; n++) {
      const key = this.generateKey(tier, days);
      keys.push(key);
      await (prisma as any).premiumKey.create({
        data: { key, tier, durationDays: days, expiresAt, createdBy, used: false },
      });
    }

    return keys;
  }
}
export default KeygenCommand;
