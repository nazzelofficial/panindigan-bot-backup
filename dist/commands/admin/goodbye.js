// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class GoodbyeCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'goodbye',
            description: 'Configure goodbye messages for leaving members',
            category: 'admin',
            cooldown: 5,
            userPermissions: [PermissionFlagsBits.ManageGuild],
            botPermissions: [PermissionFlagsBits.ManageChannels],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['goodbyeset', 'setgoodbye'],
            examples: ['/goodbye #goodbye-channel', 'p!goodbye #goodbye-channel'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const channel = interaction.options.getChannel('channel');
        const message = interaction.options.getString('message') || 'Goodbye {user}!';
        if (!channel) {
            await interaction.reply({ content: '❌ Please provide a goodbye channel.', ephemeral: true });
            return;
        }
        if (!interaction.guild)
            return;
        const prisma = getPrismaClient();
        await prisma.guild.update({
            where: { guildId: interaction.guild.id },
            data: {
                goodbyeChannelId: channel.id,
                goodbyeMessage: message,
            },
        });
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.success} Goodbye Settings Updated`)
            .setColor(COLORS.success)
            .addFields([
            { name: 'Channel', value: channel.toString(), inline: true },
            { name: 'Message', value: message.substring(0, 100), inline: true },
            { name: 'Variables', value: '{user}, {server}', inline: false },
        ])
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message, _args) {
        const channel = message.mentions.channels.first();
        const goodbyeMessage = _args.slice(1).join(' ') || 'Goodbye {user}!';
        if (!channel) {
            await message.reply('❌ Please mention a goodbye channel.');
            return;
        }
        if (!message.guild)
            return;
        const prisma = getPrismaClient();
        await prisma.guild.update({
            where: { guildId: message.guild.id },
            data: {
                goodbyeChannelId: channel.id,
                goodbyeMessage: goodbyeMessage,
            },
        });
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.success} Goodbye Settings Updated`)
            .setColor(COLORS.success)
            .addFields([
            { name: 'Channel', value: channel.toString(), inline: true },
            { name: 'Message', value: goodbyeMessage.substring(0, 100), inline: true },
            { name: 'Variables', value: '{user}, {server}', inline: false },
        ])
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default GoodbyeCommand;
