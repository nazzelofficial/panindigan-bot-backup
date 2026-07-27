// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class ChangelogCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'changelog',
            description: 'View the latest updates and patch notes',
            category: 'help',
            cooldown: 10,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['updates', 'patchnotes', 'whatsnew'],
            examples: ['/changelog', 'p!changelog'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        await this.showChangelog(interaction);
    }
    async executePrefix(message) {
        await this.showChangelog(message);
    }
    async showChangelog(interaction) {
        const client = interaction.client;
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.info} Panindigan v0.1 Changelog`)
            .setDescription('Initial release of Panindigan - The All-in-One Discord Bot')
            .setColor(COLORS.info)
            .addFields([
            { name: '🎉 Initial Release', value: 'First stable version of Panindigan bot with 900+ commands across 18 categories.', inline: false },
            { name: '🤖 AI Features', value: '• Multi-provider AI support (OpenAI, Anthropic, Gemini, Groq)\n• Conversation memory\n• Image generation\n• Code generation and debugging', inline: false },
            { name: '🎵 Music System', value: '• Lavalink v4 integration\n• High-quality audio\n• Playlist support\n• Audio effects and filters', inline: false },
            { name: '💰 Economy', value: '• Virtual currency system\n• Jobs and work\n• Gambling games\n• Marketplace and trading', inline: false },
            { name: '🛡️ Moderation', value: '• Advanced moderation tools\n• Auto-mod protection\n• Anti-nuke system\n• Warning system', inline: false },
            { name: '💎 Premium System', value: '• 4 premium tiers (Bronze, Silver, Gold, Diamond)\n• One-time permanent purchase\n• 7-day free trial\n• Feature-based access', inline: false },
            { name: '🗄️ Database', value: '• PostgreSQL for structured data\n• MongoDB for flexible documents\n• Redis for caching\n• Dual-database architecture', inline: false },
        ])
            .setFooter({ text: 'Version 0.1 • Released July 2026' })
            .setTimestamp();
        if (interaction instanceof ChatInputCommandInteraction) {
            await interaction.reply({ embeds: [embed] });
        }
        else {
            await interaction.reply({ embeds: [embed] });
        }
    }
}
export default ChangelogCommand;
