// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class SetAvatarCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'setavatar',
            description: 'Change the bot\'s avatar (Owner only)',
            category: 'admin',
            cooldown: 60,
            userPermissions: [PermissionFlagsBits.Administrator],
            botPermissions: [PermissionFlagsBits.ManageGuild],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['botavatar', 'changeavatar'],
            examples: ['/setavatar https://example.com/image.png', 'p!setavatar https://example.com/image.png'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const url = interaction.options.getString('url');
        if (!url) {
            await interaction.reply({ content: '❌ Please provide an image URL.', ephemeral: true });
            return;
        }
        try {
            await interaction.client.user.setAvatar(url);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.success} Avatar Updated`)
                .setColor(COLORS.success)
                .addFields([
                { name: 'Updated by', value: interaction.user.tag, inline: true },
            ])
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }
        catch (error) {
            await interaction.reply({ content: '❌ Failed to update avatar. Check the URL and try again.', ephemeral: true });
        }
    }
    async executePrefix(message, _args) {
        const url = args[0];
        if (!url) {
            await message.reply('❌ Please provide an image URL.');
            return;
        }
        try {
            await message.client.user.setAvatar(url);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.success} Avatar Updated`)
                .setColor(COLORS.success)
                .addFields([
                { name: 'Updated by', value: message.author.tag, inline: true },
            ])
                .setTimestamp();
            await message.reply({ embeds: [embed] });
        }
        catch (error) {
            await message.reply('❌ Failed to update avatar. Check the URL and try again.');
        }
    }
}
export default SetAvatarCommand;
