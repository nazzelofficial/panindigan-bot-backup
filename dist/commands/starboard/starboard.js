// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class StarboardCommand extends BaseCommand {
    constructor() {
        super({ name: 'starboard', description: 'Configure the starboard system', category: 'starboard', premiumTier: 'bronze', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, userPermissions: [PermissionFlagsBits.ManageGuild], aliases: ['star', 'sb'], examples: ['/starboard setup #channel', '/starboard threshold 5', '/starboard emoji ⭐', '/starboard lock', '/starboard info'] });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
            .addSubcommand(s => s.setName('setup').setDescription('Set the starboard channel').addChannelOption(o => o.setName('channel').setDescription('Starboard channel').setRequired(true)))
            .addSubcommand(s => s.setName('threshold').setDescription('Set minimum stars').addIntegerOption(o => o.setName('amount').setDescription('Stars needed').setRequired(true).setMinValue(1).setMaxValue(50)))
            .addSubcommand(s => s.setName('emoji').setDescription('Set the star emoji').addStringOption(o => o.setName('emoji').setDescription('Emoji to use').setRequired(true)))
            .addSubcommand(s => s.setName('lock').setDescription('Lock/unlock the starboard'))
            .addSubcommand(s => s.setName('disable').setDescription('Disable the starboard'))
            .addSubcommand(s => s.setName('info').setDescription('View starboard settings'))
            .setDMPermission(false));
    }
    async executeSlash(i) {
        const sub = i.options.getSubcommand();
        const prisma = getPrismaClient();
        await i.deferReply({ ephemeral: true });
        if (sub === 'setup') {
            const ch = i.options.getChannel('channel', true);
            await prisma.guild.upsert({ where: { guildId: i.guildId }, create: { guildId: i.guildId, starboardChannelId: ch.id }, update: { starboardChannelId: ch.id } });
            await i.editReply({ content: `✅ Starboard channel set to <#${ch.id}>` });
        }
        else if (sub === 'threshold') {
            const amount = i.options.getInteger('amount', true);
            await prisma.guild.upsert({ where: { guildId: i.guildId }, create: { guildId: i.guildId, starboardThreshold: amount }, update: { starboardThreshold: amount } });
            await i.editReply({ content: `✅ Starboard threshold set to **${amount}** stars.` });
        }
        else if (sub === 'emoji') {
            const emoji = i.options.getString('emoji', true);
            await prisma.guild.upsert({ where: { guildId: i.guildId }, create: { guildId: i.guildId, starboardEmoji: emoji }, update: { starboardEmoji: emoji } });
            await i.editReply({ content: `✅ Starboard emoji set to ${emoji}` });
        }
        else if (sub === 'lock') {
            const guild = await prisma.guild.upsert({ where: { guildId: i.guildId }, create: { guildId: i.guildId }, update: {} });
            const locked = !guild.starboardLocked;
            await prisma.guild.update({ where: { guildId: i.guildId }, data: { starboardLocked: locked } });
            await i.editReply({ content: `✅ Starboard is now **${locked ? 'locked' : 'unlocked'}**.` });
        }
        else if (sub === 'disable') {
            await prisma.guild.upsert({ where: { guildId: i.guildId }, create: { guildId: i.guildId }, update: { starboardChannelId: null } });
            await i.editReply({ content: '✅ Starboard disabled.' });
        }
        else if (sub === 'info') {
            const guild = await prisma.guild.findUnique({ where: { guildId: i.guildId } });
            const embed = new EmbedBuilder().setTitle('⭐ Starboard Settings').setColor(COLORS.gold)
                .addFields({ name: 'Channel', value: guild?.starboardChannelId ? `<#${guild.starboardChannelId}>` : 'Not set', inline: true }, { name: 'Emoji', value: guild?.starboardEmoji || '⭐', inline: true }, { name: 'Threshold', value: `${guild?.starboardThreshold || 3} stars`, inline: true }, { name: 'Status', value: guild?.starboardLocked ? '🔒 Locked' : '✅ Active', inline: true });
            await i.editReply({ embeds: [embed] });
        }
    }
    async executePrefix(m, _args) {
        await m.reply('Please use `/starboard` for this command.');
    }
}
export default StarboardCommand;
