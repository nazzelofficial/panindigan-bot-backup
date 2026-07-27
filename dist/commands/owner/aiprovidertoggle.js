// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import getRedisClient from '../../database/redis/client.js';
export class AiprovidertoggleCommand extends BaseCommand {
    constructor() {
        super({ name: 'aiprovidertoggle', description: 'Toggle an AI provider enabled/disabled', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['aitoggle'], examples: ['p!aiprovidertoggle openai'] });
    }
    async run(i, m, provider) {
        const send = async (e) => { if (i)
            await i.reply({ embeds: [e], flags: 64 });
        else
            await m.reply({ embeds: [e] }); };
        if (!provider)
            return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Provide a provider name.'));
        const redis = getRedisClient();
        const current = await redis.get(`ai:provider:${provider}:enabled`);
        const newState = current === 'false' ? 'true' : 'false';
        await redis.set(`ai:provider:${provider}:enabled`, newState);
        await send(new EmbedBuilder().setColor(newState === 'true' ? COLORS.success : COLORS.error)
            .setTitle(`🤖 AI Provider: ${provider}`)
            .setDescription(`Provider **${provider}** is now **${newState === 'true' ? '🟢 Enabled' : '🔴 Disabled'}**.`));
    }
    async executeSlash(i) { await this.run(i, null, i.options.getString('provider', true)); }
    async executePrefix(m, _args) { await this.run(null, m, args[0]); }
}
export default AiprovidertoggleCommand;
