// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class MockCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'mock',
            description: 'Convert text to SpongeBob mocking format',
            category: 'fun',
            premiumTier: 'free',
            cooldown: 3,
            userPermissions: [],
            botPermissions: [],
            ownerOnly: false,
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['spongebob', 'mocking'],
            examples: ['/mock text:hello world', 'p!mock hello world'],
        };
        super(options);
    }
    mockText(text) {
        return text
            .split('')
            .map((char, index) => (index % 2 === 0 ? char.toLowerCase() : char.toUpperCase()))
            .join('');
    }
    async executeSlash(interaction) {
        const text = interaction.options.getString('text', true);
        const mocked = this.mockText(text);
        const embed = new EmbedBuilder()
            .setTitle('🧽 SpongeBob Mocking')
            .addFields({ name: 'Original', value: text }, { name: 'Mocked', value: mocked })
            .setColor(COLORS.warning)
            .setThumbnail('https://i.imgur.com/7EqpCDL.png')
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message, _args) {
        if (!args.length) {
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.error} Missing Text`)
                .setDescription('Please provide text to mock!\nUsage: `p!mock <text>`')
                .setColor(COLORS.error);
            await message.reply({ embeds: [embed] });
            return;
        }
        const text = _args.join(' ');
        const mocked = this.mockText(text);
        const embed = new EmbedBuilder()
            .setTitle('🧽 SpongeBob Mocking')
            .addFields({ name: 'Original', value: text }, { name: 'Mocked', value: mocked })
            .setColor(COLORS.warning)
            .setThumbnail('https://i.imgur.com/7EqpCDL.png')
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default MockCommand;
