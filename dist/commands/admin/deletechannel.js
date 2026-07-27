// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class DeleteChannelCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'deletechannel',
            description: 'Delete a channel from the server',
            category: 'admin',
            cooldown: 5,
            userPermissions: [PermissionFlagsBits.ManageChannels],
            botPermissions: [PermissionFlagsBits.ManageChannels],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['delchannel', 'removechannel'],
            examples: ['/deletechannel #channel', 'p!deletechannel #channel'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const channel = interaction.options.getChannel('channel');
        if (!channel) {
            await interaction.reply({ content: '❌ Please provide a channel to delete.', ephemeral: true });
            return;
        }
        if (!interaction.guild)
            return;
        try {
            await channel.delete('Deleted by ' + interaction.user.tag);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.success} Channel Deleted`)
                .setColor(COLORS.success)
                .addFields([
                { name: 'Channel', value: channel.name, inline: true },
                { name: 'Type', value: channel.type.toString(), inline: true },
                { name: 'ID', value: channel.id, inline: true },
                { name: 'Deleted by', value: interaction.user.tag, inline: false },
            ])
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }
        catch (error) {
            await interaction.reply({ content: '❌ Failed to delete channel.', ephemeral: true });
        }
    }
    async executePrefix(message, _args) {
        const channel = message.mentions.channels.first();
        if (!channel) {
            await message.reply('❌ Please mention a channel to delete.');
            return;
        }
        if (!message.guild)
            return;
        try {
            await channel.delete('Deleted by ' + message.author.tag);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.success} Channel Deleted`)
                .setColor(COLORS.success)
                .addFields([
                { name: 'Channel', value: channel.name, inline: true },
                { name: 'Type', value: channel.type.toString(), inline: true },
                { name: 'ID', value: channel.id, inline: true },
                { name: 'Deleted by', value: message.author.tag, inline: false },
            ])
                .setTimestamp();
            await message.reply({ embeds: [embed] });
        }
        catch (error) {
            await message.reply('❌ Failed to delete channel.');
        }
    }
}
export default DeleteChannelCommand;
