// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class SupportCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'support',
            description: 'Get the support server link for help and community',
            category: 'help',
            cooldown: 5,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['server', 'community'],
            examples: ['/support', 'p!support'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        await this.showSupport(interaction);
    }
    async executePrefix(message) {
        await this.showSupport(message);
    }
    async showSupport(interaction) {
        const client = interaction.client;
        const supportUrl = 'https://discord.gg/panindigan';
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.success} Support Server`)
            .setDescription(`Join the official ${client.user?.username} support server!`)
            .setColor(COLORS.success)
            .addFields([
            { name: '🏠 Support Server', value: `[Click here to join](${supportUrl})`, inline: false },
            { name: '💬 What we offer', value: '• 24/7 Support\n• Feature suggestions\n• Bug reports\n• Community chat\n• Announcements', inline: false },
            { name: '❓ Need help?', value: 'Our support team is ready to assist you with any questions or issues!', inline: false },
        ])
            .setFooter({ text: 'We look forward to seeing you there!' })
            .setTimestamp();
        if (interaction instanceof ChatInputCommandInteraction) {
            await interaction.reply({ embeds: [embed] });
        }
        else {
            await interaction.reply({ embeds: [embed] });
        }
    }
}
export default SupportCommand;
