// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
import { getMongoDb as getMongoClient } from '../../database/mongodb/client.js';
import { getRedisClient } from '../../database/redis/client.js';

export class HealthcheckCommand extends BaseCommand {
  constructor() {
    super({ name: 'healthcheck', description: 'Full health check: Discord, PostgreSQL, MongoDB, Redis', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['health', 'hc'], examples: ['p!healthcheck'] } as CommandOptions);
  }
  private async run(i: ChatInputCommandInteraction | null, m: Message | null): Promise<void> {
    const send = async (e: EmbedBuilder) => { if (i) await i.reply({ embeds: [e], flags: 64 }); else await m!.reply({ embeds: [e] }); };
    const client = i?.client ?? m!.client;
    const wsPing = client.ws.ping;
    let pgOk = false, pgMs = -1;
    let mongoOk = false;
    let redisOk = false, redisMs = -1;
    try { const s = Date.now(); await getPrismaClient().$queryRaw`SELECT 1`; pgMs = Date.now() - s; pgOk = true; } catch {}
    try { const db = await getMongoClient(); await db.admin().ping(); mongoOk = true; } catch {}
    try { const s = Date.now(); await getRedisClient().ping(); redisMs = Date.now() - s; redisOk = true; } catch {}
    const ok = (v: boolean) => v ? '✅' : '❌';
    const embed = new EmbedBuilder().setColor(pgOk && mongoOk && redisOk ? COLORS.success : COLORS.error)
      .setTitle('🏥 Health Check')
      .addFields(
        { name: `${ok(true)} Discord WS`, value: `${wsPing}ms`, inline: true },
        { name: `${ok(pgOk)} PostgreSQL`, value: pgOk ? `${pgMs}ms` : 'Failed', inline: true },
        { name: `${ok(mongoOk)} MongoDB`, value: mongoOk ? 'OK' : 'Failed', inline: true },
        { name: `${ok(redisOk)} Redis`, value: redisOk ? `${redisMs}ms` : 'Failed', inline: true },
      ).setTimestamp();
    await send(embed);
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> { await this.run(i, null); }
  public async executePrefix(m: Message): Promise<void> { await this.run(null, m); }
}
export default HealthcheckCommand;
