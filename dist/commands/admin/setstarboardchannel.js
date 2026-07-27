// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class SetStarboardChannelCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'setstarboardchannel',
            description: 'Set the starboard channel',
            category: 'admin',
            cooldown: 5,
            userPermissions: [PermissionFlagsBits.ManageGuild],
            botPermissions: [PermissionFlagsBits.ManageChannels],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['starboardchannel', 'setstarboard'],
            examples: ['/setstarboardchannel #starboard', 'p!setstarboardchannel #starboard'],
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
            data: { starboardChannelId: channel.id },
        });
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.success} Starboard Channel Set`)
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
            data: { starboardChannelId: channel.id },
        });
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.success} Starboard Channel Set`)
            .setColor(COLORS.success)
            .addFields([
            { name: 'Channel', value: channel.toString(), inline: true },
            { name: 'Updated by', value: message.author.tag, inline: true },
        ])
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default SetStarboardChannelCommand;
