// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class FactCheckCommand extends BaseCommand {
    constructor() {
        super({
            name: 'factcheck',
            description: 'Fact-check a claim using AI (Gold+)',
            category: 'ai',
            premiumTier: 'gold',
            cooldown: 10,
            ownerOnly: false,
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['verify', 'checkfact'],
            examples: ['/factcheck The Great Wall of China is visible from space', 'p!factcheck Water boils at 90°C at sea level'],
        });
    }
    buildSlashCommand() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(o => o.setName('claim').setDescription('The claim to fact-check').setRequired(true).setMaxLength(1000))
            .setDMPermission(false);
    }
    async executeSlash(i) {
        const claim = i.options.getString('claim', true);
        await i.deferReply();
        try {
            const client = i.client;
            const prompt = `Fact-check the following claim carefully and objectively. Provide:
1. **Verdict** – TRUE / FALSE / PARTIALLY TRUE / UNVERIFIABLE (with a clear label)
2. **Explanation** – detailed explanation of the verdict
3. **Evidence** – what evidence supports or contradicts the claim
4. **Nuance** – any important caveats, context, or exceptions
5. **Confidence Level** – your confidence in this assessment (Low / Medium / High)

Important: Be objective. If the claim is outside your knowledge cutoff, state that clearly.

Claim: "${claim}"`;
            const response = await client.aiHandler.generateTaskResponse(claim, prompt);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} 🔎 Fact Check`)
                .setColor(COLORS.warning)
                .addFields({ name: '📋 Claim', value: claim, inline: false }, { name: '🔍 Verdict & Analysis', value: response.content.slice(0, 3800) || 'No result returned.', inline: false })
                .setFooter({ text: `Provider: ${response.provider} • AI knowledge may be limited by training cutoff` })
                .setTimestamp();
            await i.editReply({ embeds: [embed] });
        }
        catch (err) {
            await i.editReply({ content: `${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}` });
        }
    }
    async executePrefix(m, _args) {
        const claim = _args.join(' ');
        if (!claim)
            return void m.reply(`${EMOJIS.error} Please provide a claim to fact-check.`);
        const thinking = await m.reply(`${EMOJIS.ai} Fact-checking claim...`);
        try {
            const client = m.client;
            const response = await client.aiHandler.generateTaskResponse(claim, 'Fact-check this claim. Provide: verdict (TRUE/FALSE/PARTIALLY TRUE/UNVERIFIABLE), explanation, supporting or contradicting evidence, nuance, and confidence level.');
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} 🔎 Fact Check`)
                .setColor(COLORS.warning)
                .addFields({ name: '📋 Claim', value: claim.slice(0, 512), inline: false }, { name: '🔍 Verdict & Analysis', value: response.content.slice(0, 3800), inline: false })
                .setFooter({ text: `Provider: ${response.provider} • AI knowledge may be limited by training cutoff` })
                .setTimestamp();
            await thinking.edit({ content: null, embeds: [embed] });
        }
        catch (err) {
            await thinking.edit(`${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}`);
        }
    }
}
export default FactCheckCommand;
