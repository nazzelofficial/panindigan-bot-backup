// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class SetMusicChannelCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'setmusicchannel',
            description: 'Set the channel for music commands',
            category: 'admin',
            cooldown: 5,
            userPermissions: [PermissionFlagsBits.ManageGuild],
            botPermissions: [PermissionFlagsBits.ManageChannels],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['musicchannel', 'setmusic'],
            examples: ['/setmusicchannel #music', 'p!setmusicchannel #music'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const channel = interaction.options.getChannel('channel');
        if (!channel) {
            await interaction.reply({ content: '❌ Please provide a channel.', ephemeral: true });
            return;
        }
        if (!interaction.guild)
            return;
        const prisma = getPrismaClient();
        await prisma.guild.update({
            where: { guildId: interaction.guild.id },
            data: { musicChannelId: channel.id },
        });
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.success} Music Channel Set`)
            .setColor(COLORS.success)
            .addFields([
            { name: 'Channel', value: channel.toString(), inline: true },
            { name: 'Updated by', value: interaction.user.tag, inline: true },
        ])
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message, _args) {
        const channel = message.mentions.channels.first();
        if (!channel) {
            await message.reply('❌ Please mention a channel.');
            return;
        }
        if (!message.guild)
            return;
        const prisma = getPrismaClient();
        await prisma.guild.update({
            where: { guildId: message.guild.id },
            data: { musicChannelId: channel.id },
        });
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.success} Music Channel Set`)
            .setColor(COLORS.success)
            .addFields([
            { name: 'Channel', value: channel.toString(), inline: true },
            { name: 'Updated by', value: message.author.tag, inline: true },
        ])
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default SetMusicChannelCommand;
