// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { Formatter } from '../../utils/Formatter.js';
export class BoostInfoCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'boostinfo',
            description: 'Display server boost information',
            category: 'info',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['boost', 'serverboost'],
            examples: ['/boostinfo', 'p!boostinfo'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const guild = interaction.guild;
        const premiumTier = guild.premiumTier;
        const premiumSubscriptionCount = guild.premiumSubscriptionCount;
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.info} Server Boost Information`)
            .setColor(COLORS.info)
            .addFields([
            { name: 'Boost Level', value: `Level ${premiumTier}`, inline: true },
            { name: 'Total Boosts', value: Formatter.formatNumber(premiumSubscriptionCount), inline: true },
            { name: 'Boosts Needed for Next Level', value: this.getBoostsNeeded(premiumTier), inline: true },
        ])
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message) {
        const guild = message.guild;
        const premiumTier = guild.premiumTier;
        const premiumSubscriptionCount = guild.premiumSubscriptionCount;
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.info} Server Boost Information`)
            .setColor(COLORS.info)
            .addFields([
            { name: 'Boost Level', value: `Level ${premiumTier}`, inline: true },
            { name: 'Total Boosts', value: Formatter.formatNumber(premiumSubscriptionCount), inline: true },
            { name: 'Boosts Needed for Next Level', value: this.getBoostsNeeded(premiumTier), inline: true },
        ])
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
    getBoostsNeeded(tier) {
        const boostsNeeded = {
            0: '2 (Level 1)',
            1: '7 (Level 2)',
            2: '14 (Level 3)',
            3: 'Max Level',
        };
        return boostsNeeded[tier] || 'Unknown';
    }
}
export default BoostInfoCommand;
