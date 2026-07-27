// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class DonateCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'donate',
            description: 'Support the bot development through donations',
            category: 'help',
            cooldown: 30,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['supportdev', 'tip'],
            examples: ['/donate', 'p!donate'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        await this.showDonate(interaction);
    }
    async executePrefix(message) {
        await this.showDonate(message);
    }
    async showDonate(interaction) {
        const client = interaction.client;
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.success} Support Panindigan Development`)
            .setDescription('Your support helps keep the bot running and free for everyone!')
            .setColor(COLORS.success)
            .addFields([
            { name: '💰 GCash', value: 'Send to: 09XX-XXX-XXXX\n\nNote: Add your Discord ID in the message for premium credit!', inline: false },
            { name: '🏦 Bank Transfer', value: 'BPI / BDO / UnionBank\n\nContact support for account details', inline: false },
            { name: '🎁 What you get', value: '• Premium access equivalent to donation amount\n• Supporter role in our server\n• Early access to new features\n• Priority support', inline: false },
            { name: '💡 Donation Tiers', value: '₱50+ = Bronze\n₱100+ = Silver\n₱200+ = Gold\n₱400+ = Diamond', inline: false },
        ])
            .setFooter({ text: 'Thank you for your support! Every bit helps.' })
            .setTimestamp();
        if (interaction instanceof ChatInputCommandInteraction) {
            await interaction.reply({ embeds: [embed] });
        }
        else {
            await interaction.reply({ embeds: [embed] });
        }
    }
}
export default DonateCommand;
