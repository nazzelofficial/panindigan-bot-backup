// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class FeedbackCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'feedback',
            description: 'Send feedback or suggestions to the bot developers',
            category: 'help',
            cooldown: 60,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['suggest', 'report'],
            examples: ['/feedback', 'p!feedback'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        await this.showFeedback(interaction);
    }
    async executePrefix(message) {
        await this.showFeedback(message);
    }
    async showFeedback(interaction) {
        const client = interaction.client;
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.success} Send Feedback`)
            .setDescription('We value your feedback! Help us improve Panindigan.')
            .setColor(COLORS.success)
            .addFields([
            { name: '📝 How to send feedback', value: '• Join our support server\n• Use the #feedback channel\n• Or DM a developer', inline: false },
            { name: '💡 What to include', value: '• Detailed description\n• Steps to reproduce (for bugs)\n• Screenshots if applicable\n• Your Discord ID', inline: false },
            { name: '🎯 Feedback types', value: '• Bug reports\n• Feature suggestions\n• UI/UX improvements\n• General feedback', inline: false },
        ])
            .setFooter({ text: 'Thank you for helping us improve!' })
            .setTimestamp();
        const row = new ActionRowBuilder()
            .addComponents(new ButtonBuilder()
            .setLabel('🏠 Support Server')
            .setStyle(ButtonStyle.Link)
            .setURL('https://discord.gg/panindigan'), new ButtonBuilder()
            .setLabel('📧 Email')
            .setStyle(ButtonStyle.Link)
            .setURL('mailto:support@panindigan.bot'));
        if (interaction instanceof ChatInputCommandInteraction) {
            await interaction.reply({ embeds: [embed], components: [row] });
        }
        else {
            await interaction.reply({ embeds: [embed], components: [row] });
        }
    }
}
export default FeedbackCommand;
