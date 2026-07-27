// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
export class AiprovidertestCommand extends BaseCommand {
    constructor() {
        super({ name: 'aiprovidertest', description: 'Test an AI provider connection', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['aitest'], examples: ['p!aiprovidertest openai'] });
    }
    async run(i, m, provider) {
        const send = async (e) => { if (i)
            await i.reply({ embeds: [e], flags: 64 });
        else
            await m.reply({ embeds: [e] }); };
        if (!provider)
            return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Provide a provider name.'));
        const start = Date.now();
        const providerEndpoints = {
            openai: 'https://api.openai.com/v1/models',
            anthropic: 'https://api.anthropic.com/v1/messages',
            google: 'https://generativelanguage.googleapis.com/v1beta/models',
            mistral: 'https://api.mistral.ai/v1/models',
        };
        const endpoint = providerEndpoints[provider.toLowerCase()];
        if (!endpoint)
            return send(new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ Unknown provider: ${provider}. Known: ${Object.keys(providerEndpoints).join(', ')}`));
        try {
            const resp = await fetch(endpoint, { method: 'GET', signal: AbortSignal.timeout(5000) });
            const latency = Date.now() - start;
            const embed = new EmbedBuilder()
                .setColor(resp.status < 500 ? COLORS.success : COLORS.error)
                .setTitle(`🤖 Provider Test: ${provider}`)
                .addFields({ name: 'Status', value: `HTTP ${resp.status}`, inline: true }, { name: 'Latency', value: `${latency}ms`, inline: true }, { name: 'Result', value: resp.status === 401 ? '✅ Reachable (auth required)' : resp.ok ? '✅ Connected' : '⚠️ Error response', inline: true });
            await send(embed);
        }
        catch (err) {
            const latency = Date.now() - start;
            await send(new EmbedBuilder().setColor(COLORS.error).setTitle(`🤖 Provider Test: ${provider}`)
                .addFields({ name: '❌ Error', value: err.message, inline: false }, { name: 'Latency', value: `${latency}ms`, inline: true }));
        }
    }
    async executeSlash(i) { await this.run(i, null, i.options.getString('provider', true)); }
    async executePrefix(m, _args) { await this.run(null, m, args[0]); }
}
export default AiprovidertestCommand;
