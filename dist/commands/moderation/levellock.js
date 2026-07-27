// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class LevelLockCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'levellock',
            description: 'Set a minimum level required to use the server',
            category: 'moderation',
            cooldown: 3,
            userPermissions: [PermissionFlagsBits.ManageGuild],
            botPermissions: [PermissionFlagsBits.ManageRoles],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['levelgate', 'minlevel'],
            examples: ['/levellock 5', 'p!levellock 10'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const level = interaction.options.getInteger('level') || 0;
        if (!interaction.guild)
            return;
        const prisma = getPrismaClient();
        await prisma.guild.update({
            where: { guildId: interaction.guild.id },
            data: { levelLock: level },
        });
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.moderation} Level Lock Updated`)
            .setColor(level > 0 ? COLORS.warning : COLORS.success)
            .addFields([
            { name: 'Minimum Level', value: level === 0 ? 'Disabled' : level.toString(), inline: true },
            { name: 'Moderator', value: interaction.user.tag, inline: true },
            { name: 'Effect', value: level === 0 ? 'All users can join' : `Users must be level ${level}+`, inline: false },
        ])
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message, _args) {
        const level = parseInt(args[0]) || 0;
        if (!message.guild)
            return;
        const prisma = getPrismaClient();
        await prisma.guild.update({
            where: { guildId: message.guild.id },
            data: { levelLock: level },
        });
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.moderation} Level Lock Updated`)
            .setColor(level > 0 ? COLORS.warning : COLORS.success)
            .addFields([
            { name: 'Minimum Level', value: level === 0 ? 'Disabled' : level.toString(), inline: true },
            { name: 'Moderator', value: message.author.tag, inline: true },
            { name: 'Effect', value: level === 0 ? 'All users can join' : `Users must be level ${level}+`, inline: false },
        ])
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default LevelLockCommand;
