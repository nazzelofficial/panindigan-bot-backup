// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
const LOG_TYPES = [
    { value: 'message_delete', name: 'Message Deletions' },
    { value: 'message_edit', name: 'Message Edits' },
    { value: 'member_join', name: 'Member Joins' },
    { value: 'member_leave', name: 'Member Leaves' },
    { value: 'member_ban', name: 'Bans & Unbans' },
    { value: 'role_changes', name: 'Role Changes' },
    { value: 'channel_changes', name: 'Channel Changes' },
    { value: 'voice_activity', name: 'Voice Activity' },
    { value: 'moderation', name: 'Moderation Actions' },
    { value: 'boost', name: 'Server Boosts' },
    { value: 'all', name: 'All Events' },
];
export class SetLogsCommand extends BaseCommand {
    constructor() {
        super({ name: 'setlogs', description: 'Set log channels per event type 📋', category: 'admin', premiumTier: 'bronze', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, userPermissions: [PermissionFlagsBits.ManageGuild], aliases: ['logchannel', 'setlogchannel'], examples: ['/setlogs message_delete #logs', 'p!setlogs all #server-logs'] });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
            .addStringOption(o => o.setName('type').setDescription('Log event type').setRequired(true)
            .addChoices(...LOG_TYPES.map(t => ({ name: t.name, value: t.value }))))
            .addChannelOption(o => o.setName('channel').setDescription('Log channel (leave empty to disable)').setRequired(false)
            .addChannelTypes(ChannelType.GuildText))
            .setDMPermission(false));
    }
    async handle(guildId, logType, channelId, send) {
        const prisma = getPrismaClient();
        const updateData = {};
        if (logType === 'all') {
            for (const t of LOG_TYPES.filter(t => t.value !== 'all')) {
                updateData[`log_${t.value}`] = channelId;
            }
        }
        else {
            updateData[`log_${logType}`] = channelId;
        }
        // Store as JSON in guild settings since individual log channel fields may not be in schema
        const existing = await prisma.guild.findUnique({ where: { guildId } });
        const currentSettings = existing?.logChannels ? JSON.parse(existing.logChannels) : {};
        if (logType === 'all') {
            for (const t of LOG_TYPES.filter(t => t.value !== 'all'))
                currentSettings[t.value] = channelId;
        }
        else {
            currentSettings[logType] = channelId;
        }
        await prisma.guild.upsert({
            where: { guildId },
            create: { guildId, logChannels: JSON.stringify(currentSettings) },
            update: { logChannels: JSON.stringify(currentSettings) },
        });
        const typeName = LOG_TYPES.find(t => t.value === logType)?.name || logType;
        const embed = new EmbedBuilder()
            .setTitle('📋 Log Channel Updated')
            .setColor(COLORS.success)
            .addFields({ name: 'Event Type', value: typeName, inline: true }, { name: 'Channel', value: channelId ? `<#${channelId}>` : '❌ Disabled', inline: true })
            .setTimestamp();
        if (logType === 'all')
            embed.setFooter({ text: 'All event log channels updated' });
        await send({ embeds: [embed] });
    }
    async executeSlash(i) {
        const logType = i.options.getString('type', true);
        const channel = i.options.getChannel('channel');
        await this.handle(i.guildId, logType, channel?.id || null, (c) => i.reply(c));
    }
    async executePrefix(m, _args) {
        const logType = args[0]?.toLowerCase();
        if (!logType || !LOG_TYPES.find(t => t.value === logType)) {
            const list = LOG_TYPES.map(t => `\`${t.value}\` — ${t.name}`).join('\n');
            await m.reply(`❌ Usage: \`p!setlogs <type> [#channel]\`\n\n**Types:**\n${list}`);
            return;
        }
        const channelId = m.mentions.channels.first()?.id || null;
        await this.handle(m.guildId, logType, channelId, (c) => m.reply(c));
    }
}
export default SetLogsCommand;
