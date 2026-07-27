// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class ResetDataCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'resetdata',
            description: 'Reset all bot data for this server (DANGEROUS)',
            category: 'admin',
            cooldown: 60,
            userPermissions: [PermissionFlagsBits.Administrator],
            botPermissions: [PermissionFlagsBits.ManageGuild],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['reset', 'wipe'],
            examples: ['/resetdata', 'p!resetdata'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const confirm = interaction.options.getString('confirm');
        if (confirm !== 'CONFIRM') {
            await interaction.reply({ content: '❌ This command is dangerous. Type "CONFIRM" to proceed.', ephemeral: true });
            return;
        }
        if (!interaction.guild)
            return;
        await interaction.deferReply();
        try {
            const prisma = getPrismaClient();
            await prisma.user.deleteMany({
                where: { guildId: interaction.guild.id },
            });
            await prisma.guild.delete({
                where: { guildId: interaction.guild.id },
            });
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.success} Data Reset Complete`)
                .setColor(COLORS.success)
                .setDescription('All bot data for this server has been deleted.')
                .addFields([
                { name: 'Server', value: interaction.guild.name, inline: true },
                { name: 'Reset by', value: interaction.user.tag, inline: true },
            ])
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        }
        catch (error) {
            await interaction.editReply({ content: '❌ Failed to reset data.' });
        }
    }
    async executePrefix(message, _args) {
        const confirm = args[0];
        if (confirm !== 'CONFIRM') {
            await message.reply('❌ This command is dangerous. Type "CONFIRM" to proceed.');
            return;
        }
        if (!message.guild)
            return;
        await message.reply('Resetting data...');
        try {
            const prisma = getPrismaClient();
            await prisma.user.deleteMany({
                where: { guildId: message.guild.id },
            });
            await prisma.guild.delete({
                where: { guildId: message.guild.id },
            });
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.success} Data Reset Complete`)
                .setColor(COLORS.success)
                .setDescription('All bot data for this server has been deleted.')
                .addFields([
                { name: 'Server', value: message.guild.name, inline: true },
                { name: 'Reset by', value: message.author.tag, inline: true },
            ])
                .setTimestamp();
            await message.channel.send({ embeds: [embed] });
        }
        catch (error) {
            await message.reply('❌ Failed to reset data.');
        }
    }
}
export default ResetDataCommand;
