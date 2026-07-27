// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class SetBotRoleCommand extends BaseCommand {
    constructor() {
        super({ name: 'setbotrole', description: 'Auto-assign a role to new bots when they join 🤖', category: 'admin', premiumTier: 'bronze', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, userPermissions: [PermissionFlagsBits.ManageGuild, PermissionFlagsBits.ManageRoles], botPermissions: [PermissionFlagsBits.ManageRoles], aliases: ['botautorole', 'botrolerole'], examples: ['/setbotrole @Bots', 'p!setbotrole @Bots'] });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
            .addRoleOption(o => o.setName('role').setDescription('Role to assign to new bots (leave empty to disable)').setRequired(false))
            .setDMPermission(false));
    }
    async handle(guildId, roleId, send) {
        const prisma = getPrismaClient();
        await prisma.guild.upsert({
            where: { guildId },
            create: { guildId, botRoleId: roleId },
            update: { botRoleId: roleId },
        });
        const embed = new EmbedBuilder()
            .setTitle('🤖 Bot Auto-Role Updated')
            .setColor(COLORS.success)
            .setDescription(roleId
            ? `New bots will automatically receive the ${roleId ? `<@&${roleId}>` : 'configured'} role when they join this server.`
            : '❌ Bot auto-role has been disabled.')
            .addFields({ name: 'Role', value: roleId ? `<@&${roleId}>` : 'Disabled', inline: true })
            .setTimestamp();
        await send({ embeds: [embed] });
    }
    async executeSlash(i) {
        const role = i.options.getRole('role');
        await this.handle(i.guildId, role?.id || null, (c) => i.reply(c));
    }
    async executePrefix(m, _args) {
        const role = m.mentions.roles.first();
        if (!_args.length) {
            await m.reply('❌ Usage: `p!setbotrole @role` or `p!setbotrole disable`');
            return;
        }
        if (args[0].toLowerCase() === 'disable') {
            await this.handle(m.guildId, null, (c) => m.reply(c));
            return;
        }
        await this.handle(m.guildId, role?.id || null, (c) => m.reply(c));
    }
}
export default SetBotRoleCommand;
