// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class ReportCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'report',
            description: 'Report a user to the moderators',
            category: 'moderation',
            cooldown: 60,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['reportuser'],
            examples: ['/report @user spamming', 'p!report @user breaking rules'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const target = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        if (!target) {
            await interaction.reply({ content: '❌ Please provide a user to report.', ephemeral: true });
            return;
        }
        if (target.id === interaction.user.id) {
            await interaction.reply({ content: '❌ You cannot report yourself.', ephemeral: true });
            return;
        }
        if (!interaction.guild)
            return;
        const prisma = await import('../../database/postgresql/client.js').then(m => m.getPrismaClient());
        const guild = await prisma.getPrismaClient().guild.findUnique({
            where: { guildId: interaction.guild.id },
            select: { modLogChannelId: true },
        });
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.moderation} User Report`)
            .setColor(COLORS.warning)
            .addFields([
            { name: 'Reported User', value: `${target.tag} (${target.id})`, inline: true },
            { name: 'Reporter', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
            { name: 'Reason', value: reason, inline: false },
            { name: 'Server', value: interaction.guild.name, inline: true },
        ])
            .setTimestamp();
        if (guild?.modLogChannelId) {
            const modLogChannel = interaction.guild.channels.cache.get(guild.modLogChannelId);
            if (modLogChannel && modLogChannel.isTextBased()) {
                await modLogChannel.send({ embeds: [embed] });
                await interaction.reply({ content: '✅ Report sent to moderators.', ephemeral: true });
                return;
            }
        }
        await interaction.reply({ content: '❌ No mod log channel configured. Please contact an admin directly.', ephemeral: true });
    }
    async executePrefix(message, _args) {
        const target = message.mentions.users.first();
        const reason = _args.slice(1).join(' ') || 'No reason provided';
        if (!target) {
            await message.reply('❌ Please mention a user to report.');
            return;
        }
        if (target.id === message.author.id) {
            await message.reply('❌ You cannot report yourself.');
            return;
        }
        if (!message.guild)
            return;
        const prisma = await import('../../database/postgresql/client.js').then(m => m.getPrismaClient());
        const guild = await prisma.getPrismaClient().guild.findUnique({
            where: { guildId: message.guild.id },
            select: { modLogChannelId: true },
        });
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.moderation} User Report`)
            .setColor(COLORS.warning)
            .addFields([
            { name: 'Reported User', value: `${target.tag} (${target.id})`, inline: true },
            { name: 'Reporter', value: `${message.author.tag} (${message.author.id})`, inline: true },
            { name: 'Reason', value: reason, inline: false },
            { name: 'Server', value: message.guild.name, inline: true },
        ])
            .setTimestamp();
        if (guild?.modLogChannelId) {
            const modLogChannel = message.guild.channels.cache.get(guild.modLogChannelId);
            if (modLogChannel && modLogChannel.isTextBased()) {
                await modLogChannel.send({ embeds: [embed] });
                await message.reply('✅ Report sent to moderators.');
                return;
            }
        }
        await message.reply('❌ No mod log channel configured. Please contact an admin directly.');
    }
}
export default ReportCommand;
