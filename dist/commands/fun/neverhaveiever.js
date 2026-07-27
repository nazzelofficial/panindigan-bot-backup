// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class NeverHaveIEverCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'neverhaveiever',
            description: 'Play never have I ever',
            category: 'fun',
            cooldown: 10,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['nhie'],
            examples: ['/neverhaveiever', 'p!neverhaveiever'],
        };
        super(options);
    }
    statements = [
        'Never have I ever lied to my parents',
        'Never have I ever pretended to laugh at a joke I didn\'t understand',
        'Never have I ever eaten food off the floor',
        'Never have I ever sung in the shower',
        'Never have I ever danced when no one was watching',
        'Never have I ever lied about my age',
        'Never have I ever cheated on a test',
        'Never have I ever stalked someone on social media',
        'Never have I ever pretended to be sick to skip work/school',
        'Never have I ever eaten something I dropped',
    ];
    async executeSlash(interaction) {
        const statement = this.statements[Math.floor(Math.random() * this.statements.length)];
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} 🙈 Never Have I Ever`)
            .setColor(COLORS.info)
            .setDescription(`**${statement}**`)
            .addFields([
            { name: 'Instructions', value: 'React with ✅ if you have done it, ❌ if you haven\'t!', inline: false },
        ])
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message) {
        const statement = this.statements[Math.floor(Math.random() * this.statements.length)];
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} 🙈 Never Have I Ever`)
            .setColor(COLORS.info)
            .setDescription(`**${statement}**`)
            .addFields([
            { name: 'Instructions', value: 'React with ✅ if you have done it, ❌ if you haven\'t!', inline: false },
        ])
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default NeverHaveIEverCommand;
