// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class UnignoreChannelCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'unignorechannel',
            description: 'Stop ignoring commands in a specific channel',
            category: 'admin',
            cooldown: 3,
            userPermissions: [PermissionFlagsBits.Administrator],
            botPermissions: [PermissionFlagsBits.ManageChannels],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['unignore', 'channelunignore'],
            examples: ['/unignorechannel #spam', 'p!unignorechannel #spam'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const channel = interaction.options.getChannel('channel') || interaction.channel;
        if (!channel || !interaction.guild)
            return;
        const prisma = getPrismaClient();
        const guild = await prisma.guild.findUnique({
            where: { guildId: interaction.guild.id },
        });
        const ignoredChannels = guild?.ignoredChannels || [];
        if (!ignoredChannels.includes(channel.id)) {
            await interaction.reply({ content: '❌ This channel is not ignored.', ephemeral: true });
            return;
        }
        await prisma.guild.update({
            where: { guildId: interaction.guild.id },
            data: { ignoredChannels: ignoredChannels.filter(c => c !== channel.id) },
        });
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.success} Channel Unignored`)
            .setColor(COLORS.success)
            .addFields([
            { name: 'Channel', value: channel.toString(), inline: true },
            { name: 'Unignored by', value: interaction.user.tag, inline: true },
        ])
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message, _args) {
        const channel = message.mentions.channels.first() || message.channel;
        if (!channel || !message.guild)
            return;
        const prisma = getPrismaClient();
        const guild = await prisma.guild.findUnique({
            where: { guildId: message.guild.id },
        });
        const ignoredChannels = guild?.ignoredChannels || [];
        if (!ignoredChannels.includes(channel.id)) {
            await message.reply('❌ This channel is not ignored.');
            return;
        }
        await prisma.guild.update({
            where: { guildId: message.guild.id },
            data: { ignoredChannels: ignoredChannels.filter(c => c !== channel.id) },
        });
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.success} Channel Unignored`)
            .setColor(COLORS.success)
            .addFields([
            { name: 'Channel', value: channel.toString(), inline: true },
            { name: 'Unignored by', value: message.author.tag, inline: true },
        ])
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default UnignoreChannelCommand;
