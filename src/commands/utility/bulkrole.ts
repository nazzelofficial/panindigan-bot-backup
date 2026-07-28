// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';

export class BulkroleCommand extends BaseCommand {
  constructor() {
    super({ name: 'bulkrole', description: 'Bulk add/remove a role to/from multiple members', category: 'utility', premiumTier: 'diamond', cooldown: 15, guildOnly: true, ownerOnly: false, slashCommand: true, prefixCommand: true, userPermissions: [PermissionFlagsBits.ManageRoles], botPermissions: [PermissionFlagsBits.ManageRoles], aliases: ['rolebulk', 'massrole'], examples: ['p!bulkrole add @Verified @user1 @user2', 'p!bulkrole remove @Member all'] } as CommandOptions);
  }
  private async run(i: ChatInputCommandInteraction | null, m: Message | null, action: string, roleId: string, targets: string[]): Promise<void> {
    const guild = i?.guild ?? m?.guild;
    if (!guild) return;
    const send = async (e: EmbedBuilder) => { if (i) await i.reply({ embeds: [e], flags: 64 }); else await m!.reply({ embeds: [e] }); };
    if (!action || !roleId) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Usage: `bulkrole add/remove <@role> <@user...> or all`'));
    const role = guild.roles.cache.get(roleId.replace(/[<@&>]/g, ''));
    if (!role) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Role not found.'));
    if (role.position >= (guild.members.me?.roles.highest.position ?? 0)) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ I cannot manage that role (too high in hierarchy).'));
    const isAll = targets.includes('all');
    await guild.members.fetch();
    const members = isAll ? [...guild.members.cache.filter(m => !m.user.bot).values()] : targets.map(t => guild.members.cache.get(t.replace(/[<@!>]/g, ''))).filter(Boolean) as any[];
    await send(new EmbedBuilder().setColor(COLORS.default).setTitle(`🔄 Bulk Role ${action.charAt(0).toUpperCase() + action.slice(1)}`).setDescription(`Processing ${members.length} members...`));
    let success = 0, failed = 0;
    for (const member of members.slice(0, 100)) {
      try {
        if (action === 'add') await member.roles.add(role);
        else await member.roles.remove(role);
        success++;
      } catch { failed++; }
    }
    const result = new EmbedBuilder().setColor(COLORS.success).setTitle(`✅ Bulk Role Complete`)
      .addFields({ name: action === 'add' ? '✅ Added' : '✅ Removed', value: `${success}`, inline: true }, { name: '❌ Failed', value: `${failed}`, inline: true });
    if (i) await i.followUp({ embeds: [result], flags: 64 }); else await m!.channel.send({ embeds: [result] });
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> { await this.run(i, null, i.options.getString('action', true), i.options.getRole('role', true).id, []); }
  public async executePrefix(m: Message, args: string[]): Promise<void> { await this.run(null, m, args[0], args[1], args.slice(2)); }
}
export default BulkroleCommand;
