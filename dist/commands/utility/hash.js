// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import crypto from 'crypto';
const SUPPORTED_ALGORITHMS = ['md5', 'sha1', 'sha256', 'sha512'];
export class HashCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'hash',
            description: 'Hash text using various algorithms (md5, sha1, sha256, sha512)',
            category: 'utility',
            premiumTier: 'free',
            cooldown: 3,
            userPermissions: [],
            botPermissions: [],
            ownerOnly: false,
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['checksum'],
            examples: ['/hash sha256 Hello World', 'p!hash md5 my text here'],
        };
        super(options);
    }
    computeHash(algorithm, text) {
        return crypto.createHash(algorithm).update(text).digest('hex');
    }
    async executeSlash(interaction) {
        const algorithm = (interaction.options.getString('algorithm') || 'sha256').toLowerCase();
        const text = interaction.options.getString('text') || '';
        if (!SUPPORTED_ALGORITHMS.includes(algorithm)) {
            const embed = new EmbedBuilder()
                .setColor(COLORS.error)
                .setTitle(`${EMOJIS.error} Invalid Algorithm`)
                .setDescription(`Supported algorithms: \`${SUPPORTED_ALGORITHMS.join('`, `')}\``);
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }
        if (!text) {
            const embed = new EmbedBuilder()
                .setColor(COLORS.error)
                .setTitle(`${EMOJIS.error} No Text Provided`)
                .setDescription('Please provide text to hash.');
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }
        const hash = this.computeHash(algorithm, text);
        const embed = new EmbedBuilder()
            .setColor(COLORS.default)
            .setTitle(`${EMOJIS.utility} Hash Result`)
            .addFields({ name: 'Algorithm', value: algorithm.toUpperCase(), inline: true }, { name: 'Input Length', value: `${text.length} characters`, inline: true }, { name: 'Hash', value: `\`\`\`${hash}\`\`\`` })
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message, _args) {
        if (args.length < 2) {
            const embed = new EmbedBuilder()
                .setColor(COLORS.error)
                .setTitle(`${EMOJIS.error} Usage`)
                .setDescription(`\`p!hash <algorithm> <text>\`\nAlgorithms: \`${SUPPORTED_ALGORITHMS.join('`, `')}\``);
            await message.reply({ embeds: [embed] });
            return;
        }
        const algorithm = args[0].toLowerCase();
        const text = _args.slice(1).join(' ');
        if (!SUPPORTED_ALGORITHMS.includes(algorithm)) {
            const embed = new EmbedBuilder()
                .setColor(COLORS.error)
                .setTitle(`${EMOJIS.error} Invalid Algorithm`)
                .setDescription(`Supported algorithms: \`${SUPPORTED_ALGORITHMS.join('`, `')}\``);
            await message.reply({ embeds: [embed] });
            return;
        }
        const hash = this.computeHash(algorithm, text);
        const embed = new EmbedBuilder()
            .setColor(COLORS.default)
            .setTitle(`${EMOJIS.utility} Hash Result`)
            .addFields({ name: 'Algorithm', value: algorithm.toUpperCase(), inline: true }, { name: 'Input Length', value: `${text.length} characters`, inline: true }, { name: 'Hash', value: `\`\`\`${hash}\`\`\`` })
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default HashCommand;
