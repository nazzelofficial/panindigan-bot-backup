// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class EightBallCommand extends BaseCommand {
    constructor() {
        const options = {
            name: '8ball',
            description: 'Ask the magic 8-ball a question',
            category: 'fun',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['magic8ball', 'eightball'],
            examples: ['/8ball Will I win?', 'p!8ball Will I win?'],
        };
        super(options);
    }
    responses = [
        'Yes, definitely.',
        'It is certain.',
        'Without a doubt.',
        'Yes, absolutely.',
        'You may rely on it.',
        'As I see it, yes.',
        'Most likely.',
        'Outlook good.',
        'Yes.',
        'Signs point to yes.',
        'Reply hazy, try again.',
        'Ask again later.',
        'Better not tell you now.',
        'Cannot predict now.',
        'Concentrate and ask again.',
        'Don\'t count on it.',
        'My reply is no.',
        'My sources say no.',
        'Outlook not so good.',
        'Very doubtful.',
    ];
    async executeSlash(interaction) {
        const question = interaction.options.getString('question') || 'No question asked';
        const response = this.responses[Math.floor(Math.random() * this.responses.length)];
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.magic} Magic 8-Ball`)
            .setColor(COLORS.info)
            .addFields([
            { name: 'Question', value: question, inline: false },
            { name: 'Answer', value: response, inline: false },
        ])
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message) {
        const _args = message.content.split(' ').slice(1);
        const question = _args.join(' ') || 'No question asked';
        const response = this.responses[Math.floor(Math.random() * this.responses.length)];
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.magic} Magic 8-Ball`)
            .setColor(COLORS.info)
            .addFields([
            { name: 'Question', value: question, inline: false },
            { name: 'Answer', value: response, inline: false },
        ])
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default EightBallCommand;
