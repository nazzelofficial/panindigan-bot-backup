import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';
import getMongoClient from '../../database/mongodb/client';
import crypto from 'crypto';

function generateKey(): string {
  return Array.from({ length: 4 }, () => crypto.randomBytes(2).toString('hex').toUpperCase()).join('-');
}

export class KeybulkCommand extends BaseCommand {
  constructor() {
    super({ name: 'keybulk', description: 'Bulk generate premium keys', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['kbulk'], examples: ['p!keybulk gold 5'] } as CommandOptions);
  }
  private async run(i: ChatInputCommandInteraction | null, m: Message | null, tier: string, count: number): Promise<void> {
    const send = async (e: EmbedBuilder) => { if (i) await i.reply({ embeds: [e], flags: 64 }); else await m!.reply({ embeds: [e] }); };
    if (!tier || !count) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Usage: `keybulk <tier> <count>`'));
    const safeCount = Math.min(Math.max(count, 1), 25);
    const keys = Array.from({ length: safeCount }, () => ({ key: generateKey(), tier, activated: false, createdAt: new Date() }));
    const db = await getMongoClient();
    await db.collection('premium_keys').insertMany(keys);
    const embed = new EmbedBuilder().setColor(COLORS.success).setTitle(`🔑 Generated ${safeCount} ${tier} Keys`)
      .setDescription('```\n' + keys.map(k => k.key).join('\n') + '\n```');
    await send(embed);
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> { await this.run(i, null, i.options.getString('tier', true), i.options.getInteger('count', true)); }
  public async executePrefix(m: Message, args: string[]): Promise<void> { await this.run(null, m, args[0], parseInt(args[1]) || 1); }
}
export default KeybulkCommand;
