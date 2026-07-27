// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import getPrismaClient from '../../database/postgresql/client.js';
import getRedisClient from '../../database/redis/client.js';
export class LatencyCommand extends BaseCommand {
    constructor() {
        super({ name: 'latency', description: 'Show API latency breakdown (Discord, DB, Redis)', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['ping2', 'latency'], examples: ['p!latency'] });
    }
    async run(i, m) {
        const client = i?.client ?? m.client;
        const send = async (e) => { if (i)
            await i.reply({ embeds: [e], flags: 64 });
        else
            await m.reply({ embeds: [e] }); };
        const wsPing = client.ws.ping;
        let dbPing = -1, redisPing = -1;
        try {
            const start = Date.now();
            await getPrismaClient().$queryRaw `SELECT 1`;
            dbPing = Date.now() - start;
        }
        catch { /* skip */ }
        try {
            const start = Date.now();
            await getRedisClient().ping();
            redisPing = Date.now() - start;
        }
        catch { /* skip */ }
        const fmt = (n) => n === -1 ? '❌ Failed' : `${n}ms`;
        const embed = new EmbedBuilder().setColor(COLORS.default).setTitle('🏓 Latency Breakdown')
            .addFields({ name: '📡 Discord WebSocket', value: fmt(wsPing), inline: true }, { name: '🗄️ PostgreSQL', value: fmt(dbPing), inline: true }, { name: '⚡ Redis', value: fmt(redisPing), inline: true });
        await send(embed);
    }
    async executeSlash(i) { await this.run(i, null); }
    async executePrefix(m) { await this.run(null, m); }
}
export default LatencyCommand;
