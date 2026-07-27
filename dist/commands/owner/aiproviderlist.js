// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import getRedisClient from '../../database/redis/client.js';
const PROVIDERS = ['openai', 'anthropic', 'google', 'mistral', 'cohere', 'groq'];
export class AiproviderlistCommand extends BaseCommand {
    constructor() {
        super({ name: 'aiproviderlist', description: 'List all AI providers and their status', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['ailist'], examples: ['p!aiproviderlist'] });
    }
    async run(i, m) {
        const send = async (e) => { if (i)
            await i.reply({ embeds: [e], flags: 64 });
        else
            await m.reply({ embeds: [e] }); };
        const redis = getRedisClient();
        const statuses = await Promise.all(PROVIDERS.map(async (p) => {
            const enabled = await redis.get(`ai:provider:${p}:enabled`);
            return { name: p, enabled: enabled !== 'false' };
        }));
        const embed = new EmbedBuilder().setColor(COLORS.default).setTitle('🤖 AI Providers')
            .setDescription(statuses.map(p => `${p.enabled ? '🟢' : '🔴'} **${p.name}** — ${p.enabled ? 'Enabled' : 'Disabled'}`).join('\n'));
        await send(embed);
    }
    async executeSlash(i) { await this.run(i, null); }
    async executePrefix(m) { await this.run(null, m); }
}
export default AiproviderlistCommand;
