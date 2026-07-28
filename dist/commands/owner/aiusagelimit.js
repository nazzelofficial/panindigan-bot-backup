// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getRedisClient } from '../../database/redis/client.js';
export class AiusagelimitCommand extends BaseCommand {
    constructor() {
        super({ name: 'aiusagelimit', description: 'Set AI usage limit for a guild', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['ailimit'], examples: ['p!aiusagelimit 123456789 100'] });
    }
    async run(i, m, guildId, limit) {
        const send = async (e) => { if (i)
            await i.reply({ embeds: [e], flags: 64 });
        else
            await m.reply({ embeds: [e] }); };
        if (!guildId || !limit)
            return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Usage: `aiusagelimit <guild_id> <daily_limit>`'));
        const redis = getRedisClient();
        await redis.set(`ai:limit:guild:${guildId}`, limit.toString());
        await send(new EmbedBuilder().setColor(COLORS.success).setTitle('🤖 AI Usage Limit Set')
            .addFields({ name: 'Guild', value: guildId, inline: true }, { name: 'Daily Limit', value: limit.toLocaleString(), inline: true }));
    }
    async executeSlash(i) { await this.run(i, null, i.options.getString('guild_id', true), i.options.getInteger('limit', true)); }
    async executePrefix(m, _args) { await this.run(null, m, args[0], parseInt(args[1])); }
}
export default AiusagelimitCommand;
