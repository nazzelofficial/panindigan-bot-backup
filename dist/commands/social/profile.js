// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class ProfileCommand extends BaseCommand {
    constructor() {
        super({ name: 'profile', description: 'View your or another user\'s profile card', category: 'social', premiumTier: 'free', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, aliases: ['userinfo', 'me', 'card'], examples: ['/profile', '/profile @user', 'p!profile', 'p!profile @user'] });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder().setName(this.name).setDescription(this.description).addUserOption(o => o.setName('user').setDescription('User to view').setRequired(false)).setDMPermission(false));
    }
    async buildProfile(userId, guildId) {
        const prisma = getPrismaClient();
        const [user, leveling, economy] = await Promise.all([
            prisma.user.findUnique({ where: { userId_guildId: { userId, guildId } } }),
            prisma.leveling.findUnique({ where: { userId_guildId: { userId, guildId } } }),
            prisma.economy.findUnique({ where: { userId_guildId: { userId, guildId } } }),
        ]);
        return { user, leveling, economy };
    }
    async executeSlash(i) {
        const target = i.options.getUser('user') || i.user;
        await i.deferReply();
        const { user, leveling, economy } = await this.buildProfile(target.id, i.guildId);
        const member = i.guild?.members.cache.get(target.id);
        const embed = new EmbedBuilder()
            .setTitle(`👤 ${member?.displayName || target.username}'s Profile`)
            .setColor(COLORS.default)
            .setThumbnail(target.displayAvatarURL({ size: 256 }))
            .addFields({ name: '⭐ Level', value: `${leveling?.level || 0}`, inline: true }, { name: '✨ XP', value: `${leveling?.totalXp || 0}`, inline: true }, { name: '👛 Wallet', value: `${economy?.wallet || 0}`, inline: true }, { name: '🏦 Bank', value: `${economy?.bank || 0}`, inline: true }, { name: '⭐ Rep', value: `${user?.repPoints || 0}`, inline: true }, { name: '💕 Status', value: user?.spouseId ? `Coupled with <@${user.spouseId}>` : 'Single', inline: true }, { name: '📅 Joined Discord', value: `<t:${Math.floor(target.createdTimestamp / 1000)}:D>`, inline: true }, { name: '🎭 Roles', value: member?.roles.cache.filter(r => r.id !== i.guildId).size ? `${member?.roles.cache.filter(r => r.id !== i.guildId).size} roles` : 'No roles', inline: true })
            .setFooter({ text: 'Panindigan Profile' })
            .setTimestamp();
        await i.editReply({ embeds: [embed] });
    }
    async executePrefix(m, _args) {
        const target = m.mentions.users.first() || m.author;
        const { user, leveling, economy } = await this.buildProfile(target.id, m.guildId);
        const embed = new EmbedBuilder()
            .setTitle(`👤 ${target.username}'s Profile`)
            .setColor(COLORS.default)
            .setThumbnail(target.displayAvatarURL({ size: 256 }))
            .addFields({ name: '⭐ Level', value: `${leveling?.level || 0}`, inline: true }, { name: '✨ XP', value: `${leveling?.totalXp || 0}`, inline: true }, { name: '👛 Wallet', value: `${economy?.wallet || 0}`, inline: true }, { name: '⭐ Rep', value: `${user?.repPoints || 0}`, inline: true }, { name: '💕 Status', value: user?.spouseId ? `Coupled with <@${user.spouseId}>` : 'Single', inline: true })
            .setTimestamp();
        await m.reply({ embeds: [embed] });
    }
}
export default ProfileCommand;
