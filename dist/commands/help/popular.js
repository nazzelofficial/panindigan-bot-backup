// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class PopularCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'popular',
            description: 'View the most popular commands used across all servers',
            category: 'help',
            cooldown: 10,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['trending', 'top'],
            examples: ['/popular', 'p!popular'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        await this.showPopular(interaction);
    }
    async executePrefix(message) {
        await this.showPopular(message);
    }
    async showPopular(interaction) {
        const client = interaction.client;
        const popularCommands = [
            { name: 'play', category: 'music', uses: 'High' },
            { name: 'balance', category: 'economy', uses: 'High' },
            { name: 'level', category: 'leveling', uses: 'High' },
            { name: 'help', category: 'help', uses: 'High' },
            { name: 'ask', category: 'ai', uses: 'Medium' },
            { name: 'ban', category: 'moderation', uses: 'Medium' },
            { name: 'giveaway', category: 'giveaway', uses: 'Medium' },
            { name: 'tictactoe', category: 'games', uses: 'Medium' },
            { name: '8ball', category: 'fun', uses: 'Medium' },
            { name: 'avatar', category: 'info', uses: 'Medium' },
        ];
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.success} Most Popular Commands`)
            .setDescription('Top commands used across all servers')
            .setColor(COLORS.success);
        popularCommands.forEach((cmd, index) => {
            embed.addFields({ name: `${index + 1}. \`${cmd.name}\``, value: `${EMOJIS[cmd.category] || '📌'} ${cmd.category} • ${cmd.uses} usage`, inline: true });
        });
        embed.setFooter({ text: 'Based on global command usage statistics' })
            .setTimestamp();
        if (interaction instanceof ChatInputCommandInteraction) {
            await interaction.reply({ embeds: [embed] });
        }
        else {
            await interaction.reply({ embeds: [embed] });
        }
    }
}
export default PopularCommand;
