// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, ChannelType } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { Formatter } from '../../utils/Formatter.js';
export class ChannelInfoCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'channelinfo',
            description: 'Display detailed information about a channel',
            category: 'info',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['ci', 'channel'],
            examples: ['/channelinfo #channel', 'p!channelinfo #channel'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const channel = interaction.options.getChannel('channel') || interaction.channel;
        if (!channel || channel.type === ChannelType.DM) {
            const errorEmbed = new EmbedBuilder()
                .setTitle(`${EMOJIS.error} Error`)
                .setColor(COLORS.error)
                .setDescription('Please provide a valid channel.')
                .setTimestamp();
            await interaction.reply({ embeds: [errorEmbed] });
            return;
        }
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.info} Channel Information`)
            .setColor(COLORS.info)
            .addFields([
            { name: 'Name', value: channel.name, inline: true },
            { name: 'ID', value: channel.id, inline: true },
            { name: 'Type', value: channel.type.toString(), inline: true },
            { name: 'Created', value: Formatter.formatDate(channel.createdAt), inline: true },
        ])
            .setTimestamp();
        if (channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildAnnouncement) {
            const textChannel = channel;
            embed.addFields([
                { name: 'NSFW', value: textChannel.nsfw ? 'Yes' : 'No', inline: true },
                { name: 'Topic', value: textChannel.topic || 'None', inline: false },
            ]);
        }
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message) {
        const channel = message.mentions.channels.first() || message.channel;
        if (!channel || channel.type === ChannelType.DM) {
            const errorEmbed = new EmbedBuilder()
                .setTitle(`${EMOJIS.error} Error`)
                .setColor(COLORS.error)
                .setDescription('Please provide a valid channel.')
                .setTimestamp();
            await message.reply({ embeds: [errorEmbed] });
            return;
        }
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.info} Channel Information`)
            .setColor(COLORS.info)
            .addFields([
            { name: 'Name', value: channel.name, inline: true },
            { name: 'ID', value: channel.id, inline: true },
            { name: 'Type', value: channel.type.toString(), inline: true },
            { name: 'Created', value: Formatter.formatDate(channel.createdAt), inline: true },
        ])
            .setTimestamp();
        if (channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildAnnouncement) {
            const textChannel = channel;
            embed.addFields([
                { name: 'NSFW', value: textChannel.nsfw ? 'Yes' : 'No', inline: true },
                { name: 'Topic', value: textChannel.topic || 'None', inline: false },
            ]);
        }
        await message.reply({ embeds: [embed] });
    }
}
export default ChannelInfoCommand;
