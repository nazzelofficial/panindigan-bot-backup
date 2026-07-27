// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, Role } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class LevelRolesCommand extends BaseCommand {
  constructor() {
    super({ name: 'levelroles', description: 'Manage auto-assigned roles for reaching levels', category: 'leveling', premiumTier: 'bronze', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, userPermissions: [PermissionFlagsBits.ManageRoles], aliases: ['autoroles', 'levelrewards'], examples: ['/levelroles add @role 10', '/levelroles remove @role', '/levelroles list'] } as CommandOptions);
  }
  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addSubcommand(s => s.setName('add').setDescription('Add a level role').addRoleOption(o => o.setName('role').setDescription('Role to assign').setRequired(true)).addIntegerOption(o => o.setName('level').setDescription('Required level').setRequired(true).setMinValue(1)))
      .addSubcommand(s => s.setName('remove').setDescription('Remove a level role').addRoleOption(o => o.setName('role').setDescription('Role to remove').setRequired(true)))
      .addSubcommand(s => s.setName('list').setDescription('List all level roles'))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  private async handleAdd(guildId: string, role: Role, level: number): Promise<string> {
    const prisma = getPrismaClient();
    await prisma.guild.upsert({ where: { guildId }, create: { guildId }, update: {} });
    const existing = await prisma.levelRole.findFirst({ where: { guildId, roleId: role.id } });
    if (existing) { await prisma.levelRole.update({ where: { id: existing.id }, data: { level } }); return `✅ Updated level role: <@&${role.id}> → Level **${level}**`; }
    await prisma.levelRole.create({ data: { guildId, roleId: role.id, level } });
    return `✅ Added level role: <@&${role.id}> → Level **${level}**`;
  }

  private async handleRemove(guildId: string, role: Role): Promise<string> {
    const prisma = getPrismaClient();
    const deleted = await prisma.levelRole.deleteMany({ where: { guildId, roleId: role.id } });
    return deleted.count > 0 ? `✅ Removed level role <@&${role.id}>` : `❌ No level role found for <@&${role.id}>`;
  }

  private async handleList(guildId: string): Promise<EmbedBuilder> {
    const prisma = getPrismaClient();
    const roles = await prisma.levelRole.findMany({ where: { guildId }, orderBy: { level: 'asc' } });
    const embed = new EmbedBuilder().setTitle('🎭 Level Roles').setColor(COLORS.default);
    if (!roles.length) embed.setDescription('No level roles configured. Use `/levelroles add` to add some.');
    else embed.setDescription(roles.map(r => `Level **${r.level}** → <@&${r.roleId}>`).join('\n'));
    return embed;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const sub = i.options.getSubcommand();
    if (sub === 'list') { const e = await this.handleList(i.guildId!); await i.reply({ embeds: [e] }); return; }
    const role = i.options.getRole('role', true) as Role;
    if (sub === 'add') { const level = i.options.getInteger('level', true); await i.reply(await this.handleAdd(i.guildId!, role, level)); }
    else if (sub === 'remove') { await i.reply(await this.handleRemove(i.guildId!, role)); }
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    const [sub] = _args;
    if (!sub || sub === 'list') { const e = await this.handleList(m.guildId!); await m.reply({ embeds: [e] }); return; }
    const role = m.mentions.roles.first();
    if (!role) { await m.reply('❌ Please mention a role.'); return; }
    if (sub === 'add') { const level = parseInt(args[2]); if (!level) { await m.reply('❌ Provide a level number.'); return; } await m.reply(await this.handleAdd(m.guildId!, role, level)); }
    else if (sub === 'remove') { await m.reply(await this.handleRemove(m.guildId!, role)); }
  }
}
export default LevelRolesCommand;
