// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class XpBlacklistCommand extends BaseCommand {
  constructor() {
    super({
      name: 'xpblacklist',
      description: 'Manage XP blacklisted channels and roles',
      category: 'leveling',
      premiumTier: 'bronze',
      cooldown: 5,
      ownerOnly: false,
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      userPermissions: [PermissionFlagsBits.ManageGuild],
      aliases: ['xpbl'],
      examples: [
        'p!xpblacklist channel #general',
        'p!xpblacklist role @Member',
        'p!xpblacklist list',
        '/xpblacklist channel #spam',
      ],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addSubcommand(s => s.setName('channel').setDescription('Toggle a channel on/off the XP blacklist')
        .addChannelOption(o => o.setName('channel').setDescription('Channel to blacklist/unblacklist').setRequired(true)))
      .addSubcommand(s => s.setName('role').setDescription('Toggle a role on/off the XP blacklist')
        .addRoleOption(o => o.setName('role').setDescription('Role to blacklist/unblacklist').setRequired(true)))
      .addSubcommand(s => s.setName('list').setDescription('List all XP blacklisted channels and roles'))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  private async getGuild(guildId: string) {
    const prisma = getPrismaClient();
    return prisma.guild.upsert({ where: { guildId }, create: { guildId }, update: {} });
  }

  private async toggleChannel(guildId: string, channelId: string): Promise<string> {
    const prisma = getPrismaClient();
    const guild = await this.getGuild(guildId);
    const list: string[] = Array.isArray(guild.xpBlacklistChannels) ? guild.xpBlacklistChannels as string[] : [];
    const idx = list.indexOf(channelId);
    if (idx >= 0) {
      list.splice(idx, 1);
      await prisma.guild.update({ where: { guildId }, data: { xpBlacklistChannels: list } });
      return `${EMOJIS.success} Removed <#${channelId}> from the XP blacklist.`;
    } else {
      list.push(channelId);
      await prisma.guild.update({ where: { guildId }, data: { xpBlacklistChannels: list } });
      return `${EMOJIS.success} Added <#${channelId}> to the XP blacklist.`;
    }
  }

  private async toggleRole(guildId: string, roleId: string): Promise<string> {
    const prisma = getPrismaClient();
    const guild = await this.getGuild(guildId);
    const list: string[] = Array.isArray(guild.xpBlacklistRoles) ? guild.xpBlacklistRoles as string[] : [];
    const idx = list.indexOf(roleId);
    if (idx >= 0) {
      list.splice(idx, 1);
      await prisma.guild.update({ where: { guildId }, data: { xpBlacklistRoles: list } });
      return `${EMOJIS.success} Removed <@&${roleId}> from the XP blacklist.`;
    } else {
      list.push(roleId);
      await prisma.guild.update({ where: { guildId }, data: { xpBlacklistRoles: list } });
      return `${EMOJIS.success} Added <@&${roleId}> to the XP blacklist.`;
    }
  }

  private async buildListEmbed(guildId: string): Promise<EmbedBuilder> {
    const guild = await this.getGuild(guildId);
    const channels: string[] = Array.isArray(guild.xpBlacklistChannels) ? guild.xpBlacklistChannels as string[] : [];
    const roles: string[] = Array.isArray(guild.xpBlacklistRoles) ? guild.xpBlacklistRoles as string[] : [];
    return new EmbedBuilder()
      .setTitle(`${EMOJIS.leveling} XP Blacklist`)
      .setColor(COLORS.default)
      .addFields(
        { name: '🚫 Blacklisted Channels', value: channels.length ? channels.map(c => `<#${c}>`).join('\n') : 'None', inline: true },
        { name: '🚫 Blacklisted Roles', value: roles.length ? roles.map(r => `<@&${r}>`).join('\n') : 'None', inline: true },
      )
      .setTimestamp();
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const sub = i.options.getSubcommand();
    try {
      if (sub === 'list') {
        const embed = await this.buildListEmbed(i.guildId!);
        await i.reply({ embeds: [embed] });
      } else if (sub === 'channel') {
        const ch = i.options.getChannel('channel', true);
        const msg = await this.toggleChannel(i.guildId!, ch.id);
        await i.reply({ content: msg, ephemeral: true });
      } else if (sub === 'role') {
        const role = i.options.getRole('role', true);
        const msg = await this.toggleRole(i.guildId!, role.id);
        await i.reply({ content: msg, ephemeral: true });
      }
    } catch {
      await i.reply({ content: `${EMOJIS.error} Failed to update XP blacklist.`, ephemeral: true });
    }
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    if (!m.member?.permissions.has(PermissionFlagsBits.ManageGuild)) {
      await m.reply(`${EMOJIS.error} You need **Manage Server** permission.`);
      return;
    }
    const sub = args[0]?.toLowerCase();
    try {
      if (!sub || sub === 'list') {
        const embed = await this.buildListEmbed(m.guildId!);
        await m.reply({ embeds: [embed] });
      } else if (sub === 'channel') {
        const ch = m.mentions.channels.first();
        if (!ch) { await m.reply(`${EMOJIS.error} Please mention a channel.`); return; }
        await m.reply(await this.toggleChannel(m.guildId!, ch.id));
      } else if (sub === 'role') {
        const role = m.mentions.roles.first();
        if (!role) { await m.reply(`${EMOJIS.error} Please mention a role.`); return; }
        await m.reply(await this.toggleRole(m.guildId!, role.id));
      } else {
        await m.reply(`${EMOJIS.error} Usage: \`p!xpblacklist <channel|role|list>\``);
      }
    } catch {
      await m.reply(`${EMOJIS.error} Failed to update XP blacklist.`);
    }
  }
}
export default XpBlacklistCommand;
