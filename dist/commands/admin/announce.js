// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class AnnounceCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'announce',
            description: 'Send an announcement to a specific channel',
            category: 'admin',
            cooldown: 10,
            userPermissions: [PermissionFlagsBits.ManageGuild],
            botPermissions: [PermissionFlagsBits.SendMessages],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['announcement'],
            examples: ['/announce #general Hello everyone!', 'p!announce #general Hello everyone!'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const channel = interaction.options.getChannel('channel');
        const message = interaction.options.getString('message');
        const title = interaction.options.getString('title') || '📢 Announcement';
        if (!channel) {
            await interaction.reply({ content: '❌ Please provide a channel.', ephemeral: true });
            return;
        }
        if (!message) {
            await interaction.reply({ content: '❌ Please provide a message.', ephemeral: true });
            return;
        }
        if (!interaction.guild)
            return;
        try {
            const targetChannel = interaction.guild.channels.cache.get(channel.id);
            if (!targetChannel || !targetChannel.isTextBased()) {
                await interaction.reply({ content: '❌ Invalid channel.', ephemeral: true });
                return;
            }
            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(message)
                .setColor(COLORS.info)
                .setFooter({ text: `Sent by ${interaction.user.tag}` })
                .setTimestamp();
            await targetChannel.send({ embeds: [embed] });
            const replyEmbed = new EmbedBuilder()
                .setTitle(`${EMOJIS.success} Announcement Sent`)
                .setColor(COLORS.success)
                .addFields([
                { name: 'Channel', value: targetChannel.toString(), inline: true },
                { name: 'Sent by', value: interaction.user.tag, inline: true },
            ])
                .setTimestamp();
            await interaction.reply({ embeds: [replyEmbed] });
        }
        catch (error) {
            await interaction.reply({ content: '❌ Failed to send announcement.', ephemeral: true });
        }
    }
    async executePrefix(message, _args) {
        const channel = message.mentions.channels.first();
        const announceMessage = _args.slice(1).join(' ');
        if (!channel) {
            await message.reply('❌ Please mention a channel.');
            return;
        }
        if (!announceMessage) {
            await message.reply('❌ Please provide a message.');
            return;
        }
        if (!message.guild)
            return;
        try {
            const targetChannel = message.guild.channels.cache.get(channel.id);
            if (!targetChannel || !targetChannel.isTextBased()) {
                await message.reply('❌ Invalid channel.');
                return;
            }
            const embed = new EmbedBuilder()
                .setTitle('📢 Announcement')
                .setDescription(announceMessage)
                .setColor(COLORS.info)
                .setFooter({ text: `Sent by ${message.author.tag}` })
                .setTimestamp();
            await targetChannel.send({ embeds: [embed] });
            const replyEmbed = new EmbedBuilder()
                .setTitle(`${EMOJIS.success} Announcement Sent`)
                .setColor(COLORS.success)
                .addFields([
                { name: 'Channel', value: targetChannel.toString(), inline: true },
                { name: 'Sent by', value: message.author.tag, inline: true },
            ])
                .setTimestamp();
            await message.reply({ embeds: [replyEmbed] });
        }
        catch (error) {
            await message.reply('❌ Failed to send announcement.');
        }
    }
}
export default AnnounceCommand;
