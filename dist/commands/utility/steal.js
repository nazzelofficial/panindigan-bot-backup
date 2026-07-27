// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class StealCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'steal',
            description: 'Steal an emoji from another server',
            category: 'utility',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: [],
            examples: ['/steal :emoji:', 'p!steal :emoji:'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const emojiInput = interaction.options.getString('emoji');
        if (!emojiInput) {
            const errorEmbed = new EmbedBuilder()
                .setTitle(`${EMOJIS.error} Error`)
                .setColor(COLORS.error)
                .setDescription('Please provide an emoji to steal.')
                .setTimestamp();
            await interaction.reply({ embeds: [errorEmbed] });
            return;
        }
        const emoji = this.parseEmoji(emojiInput);
        if (!emoji || !emoji.id) {
            const errorEmbed = new EmbedBuilder()
                .setTitle(`${EMOJIS.error} Error`)
                .setColor(COLORS.error)
                .setDescription('Invalid custom emoji format. Use format like :emoji: or the raw emoji.')
                .setTimestamp();
            await interaction.reply({ embeds: [errorEmbed] });
            return;
        }
        try {
            const emojiUrl = `https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? 'gif' : 'png'}`;
            const newEmoji = await interaction.guild?.emojis.create({
                attachment: emojiUrl,
                name: emoji.name || 'stolen_emoji',
            });
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.success} Emoji Stolen`)
                .setColor(COLORS.success)
                .setDescription(`Successfully added ${newEmoji} to the server!`)
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }
        catch (error) {
            const errorEmbed = new EmbedBuilder()
                .setTitle(`${EMOJIS.error} Error`)
                .setColor(COLORS.error)
                .setDescription('Could not add emoji. Make sure I have the Manage Emojis permission and the server has emoji slots available.')
                .setTimestamp();
            await interaction.reply({ embeds: [errorEmbed] });
        }
    }
    async executePrefix(message) {
        const _args = message.content.split(' ').slice(1);
        const emojiInput = args[0];
        if (!emojiInput) {
            const errorEmbed = new EmbedBuilder()
                .setTitle(`${EMOJIS.error} Error`)
                .setColor(COLORS.error)
                .setDescription('Please provide an emoji to steal.')
                .setTimestamp();
            await message.reply({ embeds: [errorEmbed] });
            return;
        }
        const emoji = this.parseEmoji(emojiInput);
        if (!emoji || !emoji.id) {
            const errorEmbed = new EmbedBuilder()
                .setTitle(`${EMOJIS.error} Error`)
                .setColor(COLORS.error)
                .setDescription('Invalid custom emoji format. Use format like :emoji: or the raw emoji.')
                .setTimestamp();
            await message.reply({ embeds: [errorEmbed] });
            return;
        }
        try {
            const emojiUrl = `https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? 'gif' : 'png'}`;
            const newEmoji = await message.guild?.emojis.create({
                attachment: emojiUrl,
                name: emoji.name || 'stolen_emoji',
            });
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.success} Emoji Stolen`)
                .setColor(COLORS.success)
                .setDescription(`Successfully added ${newEmoji} to the server!`)
                .setTimestamp();
            await message.reply({ embeds: [embed] });
        }
        catch (error) {
            const errorEmbed = new EmbedBuilder()
                .setTitle(`${EMOJIS.error} Error`)
                .setColor(COLORS.error)
                .setDescription('Could not add emoji. Make sure I have the Manage Emojis permission and the server has emoji slots available.')
                .setTimestamp();
            await message.reply({ embeds: [errorEmbed] });
        }
    }
    parseEmoji(emoji) {
        const customEmojiRegex = /<?(a)?:?(\w{2,32}):(\d{17,19})>?/;
        const match = emoji.match(customEmojiRegex);
        if (match) {
            return {
                animated: !!match[1],
                name: match[2],
                id: match[3],
            };
        }
        return {
            animated: false,
            name: emoji,
            id: null,
        };
    }
}
export default StealCommand;
