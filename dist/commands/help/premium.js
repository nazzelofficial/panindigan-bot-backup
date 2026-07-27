// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class PremiumHelpCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'premium',
            description: 'View premium tiers and their features',
            category: 'help',
            cooldown: 10,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['premiuminfo', 'tiers'],
            examples: ['/premium', 'p!premium'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        await this.showPremium(interaction);
    }
    async executePrefix(message) {
        await this.showPremium(message);
    }
    async showPremium(interaction) {
        const client = interaction.client;
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.diamond} Panindigan Premium Tiers`)
            .setDescription('One-time permanent purchase • No monthly subscriptions')
            .setColor(COLORS.diamond)
            .addFields([
            { name: '🥉 Bronze - ₱49', value: '• 30% faster cooldowns\n• Priority music queue\n• Basic AI access\n• 5 AI images/day', inline: true },
            { name: '⭐ Silver - ₱99', value: '• 40% faster cooldowns\n• Enhanced AI features\n• Playlist system\n• 15 AI images/day', inline: true },
            { name: '💎 Gold - ₱199', value: '• 50% faster cooldowns\n• Advanced AI tools\n• Automation features\n• 40 AI images/day', inline: true },
            { name: '👑 Diamond - ₱399', value: '• Zero cooldowns\n• Unlimited AI\n• Custom AI persona\n• Unlimited images', inline: true },
            { name: '🎯 Free Trial', value: '7 days of Diamond access\nNo credit card required\nOne-time per user', inline: false },
        ])
            .setFooter({ text: 'Use /premium trial to start your free trial!' })
            .setTimestamp();
        if (interaction instanceof ChatInputCommandInteraction) {
            await interaction.reply({ embeds: [embed] });
        }
        else {
            await interaction.reply({ embeds: [embed] });
        }
    }
}
export default PremiumHelpCommand;
