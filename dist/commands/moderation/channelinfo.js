// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { Formatter } from '../../utils/Formatter.js';
export class ChannelInfoCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'channelinfo',
            description: 'View detailed information about a channel',
            category: 'moderation',
            cooldown: 3,
            userPermissions: [PermissionFlagsBits.ManageChannels],
            botPermissions: [PermissionFlagsBits.ManageChannels],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['channel', 'cinfo'],
            examples: ['/channelinfo #general', 'p!channelinfo #general'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const channel = interaction.options.getChannel('target') || interaction.channel;
        if (!channel || !interaction.guild)
            return;
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
        if (channel.isTextBased()) {
            const topic = channel.topic || 'No topic';
            embed.addField('Topic', topic.substring(0, 1024), false);
            embed.addField('NSFW', channel.nsfw ? 'Yes' : 'No', true);
        }
        if (channel.isVoiceBased()) {
            embed.addField('Bitrate', `${channel.bitrate}bps`, true);
            embed.addField('User Limit', channel.userLimit ? channel.userLimit.toString() : 'Unlimited', true);
        }
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message, _args) {
        const channel = message.mentions.channels.first() || message.channel;
        if (!channel || !message.guild)
            return;
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
        if (channel.isTextBased()) {
            const topic = channel.topic || 'No topic';
            embed.addField('Topic', topic.substring(0, 1024), false);
            embed.addField('NSFW', channel.nsfw ? 'Yes' : 'No', true);
        }
        if (channel.isVoiceBased()) {
            embed.addField('Bitrate', `${channel.bitrate}bps`, true);
            embed.addField('User Limit', channel.userLimit ? channel.userLimit.toString() : 'Unlimited', true);
        }
        await message.reply({ embeds: [embed] });
    }
}
export default ChannelInfoCommand;
