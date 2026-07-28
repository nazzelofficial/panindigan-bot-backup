// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getRedisClient } from '../../database/redis/client.js';
export class RateconfigCommand extends BaseCommand {
    constructor() {
        super({ name: 'rateconfig', description: 'Update rate limit config for a tier', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['ratelimit'], examples: ['p!rateconfig gold 60'] });
    }
    async run(i, m, tier, amount) {
        const send = async (e) => { if (i)
            await i.reply({ embeds: [e], flags: 64 });
        else
            await m.reply({ embeds: [e] }); };
        if (!tier || !amount)
            return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Usage: `rateconfig <tier> <requests_per_hour>`'));
        const redis = getRedisClient();
        await redis.set(`rate:limit:${tier}`, amount.toString());
        await send(new EmbedBuilder().setColor(COLORS.success).setTitle('⚙️ Rate Limit Updated')
            .addFields({ name: 'Tier', value: tier, inline: true }, { name: 'Requests/Hour', value: amount.toString(), inline: true }));
    }
    async executeSlash(i) { await this.run(i, null, i.options.getString('tier', true), i.options.getInteger('amount', true)); }
    async executePrefix(m, _args) { await this.run(null, m, args[0], parseInt(args[1])); }
}
export default RateconfigCommand;
