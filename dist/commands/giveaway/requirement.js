// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class GiveawayRequirementCommand extends BaseCommand {
    constructor() {
        super({ name: 'grequire', description: 'Set role or level requirements for a giveaway', category: 'giveaway', premiumTier: 'free', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, userPermissions: [PermissionFlagsBits.ManageGuild], aliases: ['grequirement', 'gw-require'], examples: ['/grequire role <id> @role', 'p!grequire level <id> 10'] });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
            .addSubcommand(s => s.setName('role').setDescription('Set role requirement')
            .addStringOption(o => o.setName('id').setDescription('Giveaway ID').setRequired(true))
            .addRoleOption(o => o.setName('role').setDescription('Required role').setRequired(true)))
            .addSubcommand(s => s.setName('level').setDescription('Set level requirement')
            .addStringOption(o => o.setName('id').setDescription('Giveaway ID').setRequired(true))
            .addIntegerOption(o => o.setName('level').setDescription('Minimum level').setRequired(true).setMinValue(1)))
            .addSubcommand(s => s.setName('clear').setDescription('Clear all requirements')
            .addStringOption(o => o.setName('id').setDescription('Giveaway ID').setRequired(true)))
            .setDMPermission(false));
    }
    async executeSlash(i) {
        const sub = i.options.getSubcommand();
        const id = i.options.getString('id', true);
        const prisma = getPrismaClient();
        const g = await prisma.giveaway.findFirst({ where: { id, guildId: i.guildId, active: true } });
        if (!g) {
            await i.reply({ content: '❌ Active giveaway not found.', ephemeral: true });
            return;
        }
        if (sub === 'role') {
            const role = i.options.getRole('role', true);
            await prisma.giveaway.update({ where: { id }, data: { requiredRoleId: role.id } });
            await i.reply({ content: `✅ Giveaway now requires <@&${role.id}> to enter.`, ephemeral: true });
        }
        else if (sub === 'level') {
            const level = i.options.getInteger('level', true);
            await prisma.giveaway.update({ where: { id }, data: { requiredLevel: level } });
            await i.reply({ content: `✅ Giveaway now requires level **${level}** to enter.`, ephemeral: true });
        }
        else {
            await prisma.giveaway.update({ where: { id }, data: { requiredRoleId: null, requiredLevel: null } });
            await i.reply({ content: '✅ All requirements cleared.', ephemeral: true });
        }
    }
    async executePrefix(m, _args) {
        if (args.length < 3) {
            await m.reply('❌ Usage: `p!grequire role <id> @role` or `p!grequire level <id> <level>`');
            return;
        }
        const [sub, id, value] = _args;
        const prisma = getPrismaClient();
        const g = await prisma.giveaway.findFirst({ where: { id, guildId: m.guildId, active: true } });
        if (!g) {
            await m.reply('❌ Active giveaway not found.');
            return;
        }
        if (sub === 'role') {
            const role = m.mentions.roles.first();
            if (!role) {
                await m.reply('❌ Mention a role.');
                return;
            }
            await prisma.giveaway.update({ where: { id }, data: { requiredRoleId: role.id } });
            await m.reply(`✅ Role requirement set to <@&${role.id}>.`);
        }
        else if (sub === 'level') {
            const level = parseInt(value);
            await prisma.giveaway.update({ where: { id }, data: { requiredLevel: level } });
            await m.reply(`✅ Level requirement set to ${level}.`);
        }
    }
}
export default GiveawayRequirementCommand;
