// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class EmojiInfoCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'emojiinfo',
            description: 'Display information about an emoji',
            category: 'info',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['ei', 'emoji'],
            examples: ['/emojiinfo :emoji:', 'p!emojiinfo :emoji:'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const emoji = interaction.options.getString('emoji');
        if (!emoji) {
            const errorEmbed = new EmbedBuilder()
                .setTitle(`${EMOJIS.error} Error`)
                .setColor(COLORS.error)
                .setDescription('Please provide an emoji.')
                .setTimestamp();
            await interaction.reply({ embeds: [errorEmbed] });
            return;
        }
        const parsedEmoji = this.parseEmoji(emoji);
        if (!parsedEmoji) {
            const errorEmbed = new EmbedBuilder()
                .setTitle(`${EMOJIS.error} Error`)
                .setColor(COLORS.error)
                .setDescription('Invalid emoji.')
                .setTimestamp();
            await interaction.reply({ embeds: [errorEmbed] });
            return;
        }
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.info} Emoji Information`)
            .setColor(COLORS.info)
            .addFields([
            { name: 'Name', value: parsedEmoji.name || 'Unknown', inline: true },
            { name: 'ID', value: parsedEmoji.id || 'None', inline: true },
            { name: 'Animated', value: parsedEmoji.animated ? 'Yes' : 'No', inline: true },
            { name: 'URL', value: parsedEmoji.url || 'None', inline: false },
        ])
            .setTimestamp();
        if (parsedEmoji.url) {
            embed.setThumbnail(parsedEmoji.url);
        }
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message) {
        const _args = message.content.split(' ').slice(1);
        const emoji = args[0];
        if (!emoji) {
            const errorEmbed = new EmbedBuilder()
                .setTitle(`${EMOJIS.error} Error`)
                .setColor(COLORS.error)
                .setDescription('Please provide an emoji.')
                .setTimestamp();
            await message.reply({ embeds: [errorEmbed] });
            return;
        }
        const parsedEmoji = this.parseEmoji(emoji);
        if (!parsedEmoji) {
            const errorEmbed = new EmbedBuilder()
                .setTitle(`${EMOJIS.error} Error`)
                .setColor(COLORS.error)
                .setDescription('Invalid emoji.')
                .setTimestamp();
            await message.reply({ embeds: [errorEmbed] });
            return;
        }
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.info} Emoji Information`)
            .setColor(COLORS.info)
            .addFields([
            { name: 'Name', value: parsedEmoji.name || 'Unknown', inline: true },
            { name: 'ID', value: parsedEmoji.id || 'None', inline: true },
            { name: 'Animated', value: parsedEmoji.animated ? 'Yes' : 'No', inline: true },
            { name: 'URL', value: parsedEmoji.url || 'None', inline: false },
        ])
            .setTimestamp();
        if (parsedEmoji.url) {
            embed.setThumbnail(parsedEmoji.url);
        }
        await message.reply({ embeds: [embed] });
    }
    parseEmoji(emoji) {
        const customEmojiRegex = /<(a)?:([a-zA-Z0-9_]+):(\d+)>/;
        const match = emoji.match(customEmojiRegex);
        if (match) {
            const [, animated, name, id] = match;
            return {
                name,
                id,
                animated: animated === 'a',
                url: `https://cdn.discordapp.com/emojis/${id}.${animated ? 'gif' : 'png'}`,
            };
        }
        return {
            name: emoji,
            id: null,
            animated: false,
            url: null,
        };
    }
}
export default EmojiInfoCommand;
