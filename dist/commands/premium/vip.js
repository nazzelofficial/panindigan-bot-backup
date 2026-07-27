// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
export class VipCommand extends BaseCommand {
    constructor() {
        super({ name: 'vip', description: 'View VIP (Gold+) exclusive features', category: 'premium', premiumTier: 'gold', cooldown: 5, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['goldperks', 'vipperks'], examples: ['/vip'] });
    }
    async executeSlash(i) {
        const embed = new EmbedBuilder().setTitle('💛 VIP — Gold Premium').setColor(COLORS.gold)
            .setDescription('Welcome to VIP status! Here are your exclusive Gold perks:')
            .addFields({ name: '🎵 Extended Queue', value: 'Up to 500 songs in the music queue', inline: false }, { name: '🤖 Priority AI', value: '1,000 AI requests per day with GPT-4o access', inline: false }, { name: '🎨 HD Images', value: 'Generate HD quality AI images (1024x1024)', inline: false }, { name: '⭐ XP Multiplier', value: '+100% XP from all activities', inline: false }, { name: '💰 Economy Boost', value: '+50% from all money commands', inline: false }, { name: '🔇 No Cooldown (Most Commands)', value: 'Cooldowns reduced by 75%', inline: false }, { name: '📊 Analytics', value: 'Access to personal analytics dashboard', inline: false }, { name: '🎖️ VIP Badge', value: 'Exclusive Gold badge on your profile', inline: false })
            .setFooter({ text: 'Gold Premium — ₱199 one-time' });
        await i.reply({ embeds: [embed] });
    }
    async executePrefix(m) {
        const embed = new EmbedBuilder().setTitle('💛 VIP Gold Perks').setColor(COLORS.gold)
            .setDescription('**+100% XP** | **1000 AI/day** | **HD Images** | **No Cooldown** | **Analytics**');
        await m.reply({ embeds: [embed] });
    }
}
export default VipCommand;
