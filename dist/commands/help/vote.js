// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class VoteCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'vote',
            description: 'Vote for the bot on bot lists to support development',
            category: 'help',
            cooldown: 60,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['upvote'],
            examples: ['/vote', 'p!vote'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        await this.showVote(interaction);
    }
    async executePrefix(message) {
        await this.showVote(message);
    }
    async showVote(interaction) {
        const client = interaction.client;
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.success} Vote for ${client.user?.username}`)
            .setDescription('Support the bot by voting on bot lists!')
            .setColor(COLORS.success)
            .addFields([
            { name: '🗳️ Top.gg', value: '[Vote on Top.gg](https://top.gg/bot/YOUR_BOT_ID)', inline: false },
            { name: '⭐ Discord Bot List', value: '[Vote on DBL](https://discordbotlist.com/bots/YOUR_BOT_ID)', inline: false },
            { name: '🎁 Rewards', value: '• Vote daily for rewards\n• Help the bot grow\n• Support development\n• Get premium perks', inline: false },
            { name: '💡 Why vote?', value: 'Voting helps the bot reach more servers and improves visibility. Your support is greatly appreciated!', inline: false },
        ])
            .setFooter({ text: 'Thank you for your support!' })
            .setTimestamp();
        if (interaction instanceof ChatInputCommandInteraction) {
            await interaction.reply({ embeds: [embed] });
        }
        else {
            await interaction.reply({ embeds: [embed] });
        }
    }
}
export default VoteCommand;
