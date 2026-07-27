// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class AvatarCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'avatar',
            description: 'Display a user avatar',
            category: 'info',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['av', 'pfp'],
            examples: ['/avatar', '/avatar @user', 'p!avatar @user'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const target = interaction.options.getUser('user') || interaction.user;
        const member = interaction.options.getMember('user');
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.info} ${target.username}'s Avatar`)
            .setColor(COLORS.info)
            .setImage(target.displayAvatarURL({ size: 4096, extension: 'png' }))
            .setDescription(`[Download](${target.displayAvatarURL({ size: 4096, extension: 'png' })})`)
            .setTimestamp();
        if (member && 'avatar' in member && member.avatar) {
            embed.addFields([
                { name: 'Server Avatar', value: `[Download](${member.displayAvatarURL({ size: 4096, extension: 'png' })})`, inline: false },
            ]);
            embed.setThumbnail(member.displayAvatarURL({ size: 4096, extension: 'png' }));
        }
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message) {
        const target = message.mentions.users.first() || message.author;
        const member = message.mentions.members?.first() || message.member;
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.info} ${target.username}'s Avatar`)
            .setColor(COLORS.info)
            .setImage(target.displayAvatarURL({ size: 4096, extension: 'png' }))
            .setDescription(`[Download](${target.displayAvatarURL({ size: 4096, extension: 'png' })})`)
            .setTimestamp();
        if (member && 'avatar' in member && member.avatar) {
            embed.addFields([
                { name: 'Server Avatar', value: `[Download](${member.displayAvatarURL({ size: 4096, extension: 'png' })})`, inline: false },
            ]);
            embed.setThumbnail(member.displayAvatarURL({ size: 4096, extension: 'png' }));
        }
        await message.reply({ embeds: [embed] });
    }
}
export default AvatarCommand;
