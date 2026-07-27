// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class PrefixCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'prefix',
            description: 'Change the bot prefix for this server',
            category: 'admin',
            cooldown: 5,
            userPermissions: [PermissionFlagsBits.Administrator],
            botPermissions: [PermissionFlagsBits.ManageGuild],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['setprefix', 'changeprefix'],
            examples: ['/prefix !', 'p!prefix -'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const newPrefix = interaction.options.getString('prefix');
        if (!newPrefix) {
            await interaction.reply({ content: '❌ Please provide a new prefix.', ephemeral: true });
            return;
        }
        if (newPrefix.length > 5) {
            await interaction.reply({ content: '❌ Prefix cannot exceed 5 characters.', ephemeral: true });
            return;
        }
        if (!interaction.guild)
            return;
        const prisma = getPrismaClient();
        await prisma.guild.update({
            where: { guildId: interaction.guild.id },
            data: { prefix: newPrefix },
        });
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.success} Prefix Updated`)
            .setColor(COLORS.success)
            .addFields([
            { name: 'New Prefix', value: `\`${newPrefix}\``, inline: true },
            { name: 'Updated by', value: interaction.user.tag, inline: true },
        ])
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message, _args) {
        const newPrefix = args[0];
        if (!newPrefix) {
            await message.reply('❌ Please provide a new prefix.');
            return;
        }
        if (newPrefix.length > 5) {
            await message.reply('❌ Prefix cannot exceed 5 characters.');
            return;
        }
        if (!message.guild)
            return;
        const prisma = getPrismaClient();
        await prisma.guild.update({
            where: { guildId: message.guild.id },
            data: { prefix: newPrefix },
        });
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.success} Prefix Updated`)
            .setColor(COLORS.success)
            .addFields([
            { name: 'New Prefix', value: `\`${newPrefix}\``, inline: true },
            { name: 'Updated by', value: message.author.tag, inline: true },
        ])
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default PrefixCommand;
