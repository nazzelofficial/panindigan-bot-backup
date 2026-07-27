// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
const SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '⭐', '💎', '7️⃣', '🎰'];
const PAYOUTS = {
    '💎': 10, '7️⃣': 7, '⭐': 5, '🎰': 4, '🍇': 3, '🍊': 2, '🍋': 1.5, '🍒': 1,
};
function spin() {
    return [0, 1, 2].map(() => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
}
function evaluate(reels) {
    const [a, b, c] = reels;
    if (a === b && b === c)
        return { result: `JACKPOT! Three ${a}`, multiplier: PAYOUTS[a] * 3 };
    if (a === b || b === c || a === c) {
        const sym = a === b ? a : c;
        return { result: `Two ${sym} — small win!`, multiplier: PAYOUTS[sym] * 0.5 };
    }
    return { result: 'No match — try again!', multiplier: 0 };
}
export class SlotsCommand extends BaseCommand {
    constructor() {
        super({
            name: 'slots',
            description: 'Spin the slot machine and try your luck!',
            category: 'games',
            premiumTier: 'bronze',
            cooldown: 5,
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['slot', 'slotmachine'],
            examples: ['/slots', 'p!slots'],
        });
    }
    async runSlots(reply, editReply, username) {
        // Spinning animation
        const spinEmbed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} Slot Machine`)
            .setColor(COLORS.info)
            .setDescription('🎰 Spinning...\n\n`[ 🎲 | 🎲 | 🎲 ]`')
            .setTimestamp();
        await reply({ embeds: [spinEmbed] });
        await new Promise(r => setTimeout(r, 1500));
        const reels = spin();
        const { result, multiplier } = evaluate(reels);
        const won = multiplier > 0;
        const resultEmbed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} Slot Machine`)
            .setColor(won ? (multiplier >= 10 ? COLORS.gold : COLORS.success) : COLORS.error)
            .setDescription(`**[ ${reels.join(' | ')} ]**\n\n${won ? '🎉' : '😢'} **${result}**`)
            .addFields({ name: '👤 Player', value: username, inline: true }, { name: '🏆 Status', value: won ? `Won! (${multiplier}x)` : 'Lost', inline: true })
            .setFooter({ text: won && multiplier >= PAYOUTS['💎'] * 3 ? '💎 JACKPOT! 💎' : 'Better luck next time!' })
            .setTimestamp();
        await editReply({ embeds: [resultEmbed] });
    }
    async executeSlash(interaction) {
        await this.runSlots((c) => interaction.reply(c), (c) => interaction.editReply(c), interaction.user.username);
    }
    async executePrefix(message) {
        let sent;
        await this.runSlots(async (c) => { sent = await message.reply(c); return sent; }, async (c) => sent.edit(c), message.author.username);
    }
}
export default SlotsCommand;
