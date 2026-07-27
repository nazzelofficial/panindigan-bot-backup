// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class VoteCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'vote',
            description: 'Get links to vote for the bot',
            category: 'utility',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: [],
            examples: ['/vote', 'p!vote'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.info} 🗳️ Vote for Panindigan`)
            .setColor(COLORS.info)
            .setDescription('Support the bot by voting on these platforms!')
            .addFields([
            { name: 'Top.gg', value: '[Vote here](https://top.gg)', inline: true },
            { name: 'Discord Bot List', value: '[Vote here](https://discordbotlist.com)', inline: true },
            { name: 'Bots For Discord', value: '[Vote here](https://botsfordiscord.com)', inline: true },
        ])
            .setFooter({ text: 'Voting helps the bot grow!' })
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message) {
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.info} 🗳️ Vote for Panindigan`)
            .setColor(COLORS.info)
            .setDescription('Support the bot by voting on these platforms!')
            .addFields([
            { name: 'Top.gg', value: '[Vote here](https://top.gg)', inline: true },
            { name: 'Discord Bot List', value: '[Vote here](https://discordbotlist.com)', inline: true },
            { name: 'Bots For Discord', value: '[Vote here](https://botsfordiscord.com)', inline: true },
        ])
            .setFooter({ text: 'Voting helps the bot grow!' })
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default VoteCommand;
