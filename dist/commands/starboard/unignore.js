// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class StarboardUnignoreCommand extends BaseCommand {
    constructor() {
        super({ name: 'starboard-unignore', description: 'Remove a channel from the starboard ignore list', category: 'starboard', premiumTier: 'free', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, userPermissions: [PermissionFlagsBits.ManageGuild], aliases: ['sb-unignore', 'sbunignore'], examples: ['/starboard-unignore #channel'] });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder().setName(this.name).setDescription(this.description).addChannelOption(o => o.setName('channel').setDescription('Channel to unignore').setRequired(false)).setDMPermission(false));
    }
    async executeSlash(i) {
        const channel = i.options.getChannel('channel') || i.channel;
        const prisma = getPrismaClient();
        const guild = await prisma.guild.findUnique({ where: { guildId: i.guildId } });
        let ignored = guild?.starboardIgnoredChannels ? JSON.parse(guild.starboardIgnoredChannels) : [];
        ignored = ignored.filter((id) => id !== channel.id);
        await prisma.guild.upsert({ where: { guildId: i.guildId }, create: { guildId: i.guildId }, update: { starboardIgnoredChannels: JSON.stringify(ignored) } });
        await i.reply({ content: `✅ <#${channel.id}> is no longer ignored by the starboard.`, ephemeral: true });
    }
    async executePrefix(m) {
        const channel = m.mentions.channels.first() || m.channel;
        const prisma = getPrismaClient();
        const guild = await prisma.guild.findUnique({ where: { guildId: m.guildId } });
        let ignored = guild?.starboardIgnoredChannels ? JSON.parse(guild.starboardIgnoredChannels) : [];
        ignored = ignored.filter((id) => id !== channel.id);
        await prisma.guild.upsert({ where: { guildId: m.guildId }, create: { guildId: m.guildId }, update: { starboardIgnoredChannels: JSON.stringify(ignored) } });
        await m.reply(`✅ <#${channel.id}> removed from starboard ignore list.`);
    }
}
export default StarboardUnignoreCommand;
