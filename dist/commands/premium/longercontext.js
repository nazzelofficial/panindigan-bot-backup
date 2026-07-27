// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
export class LongerContextCommand extends BaseCommand {
    constructor() {
        super({ name: 'longercontext', description: 'Enable longer AI conversation context (Diamond perk)', category: 'premium', premiumTier: 'diamond', cooldown: 5, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['longmemory', 'extendedcontext'], examples: ['/longercontext'] });
    }
    async executeSlash(i) {
        const tierContextLengths = { free: 5, bronze: 10, silver: 20, gold: 50, diamond: 200 };
        const embed = new EmbedBuilder().setTitle('🧠 AI Context Lengths').setColor(COLORS.diamond)
            .setDescription('How many past messages the AI remembers in each conversation:')
            .addFields({ name: '🆓 Free', value: '5 messages', inline: true }, { name: '🥉 Bronze', value: '10 messages', inline: true }, { name: '🥈 Silver', value: '20 messages', inline: true }, { name: '💛 Gold', value: '50 messages', inline: true }, { name: '💎 Diamond', value: '**200 messages**', inline: true })
            .setFooter({ text: 'Diamond Premium — Longer context = smarter, more coherent conversations' });
        await i.reply({ embeds: [embed] });
    }
    async executePrefix(m) {
        await m.reply('🧠 **AI Context:** Free: 5 | Bronze: 10 | Silver: 20 | Gold: 50 | Diamond: 200 messages');
    }
}
export default LongerContextCommand;
