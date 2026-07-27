// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class GiveawayBlacklistCommand extends BaseCommand {
    constructor() {
        super({ name: 'gblacklist', description: 'Blacklist a user from all giveaways', category: 'giveaway', premiumTier: 'free', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, userPermissions: [PermissionFlagsBits.ManageGuild], aliases: ['giveaway-blacklist', 'gw-blacklist'], examples: ['/gblacklist @user', 'p!gblacklist @user'] });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
            .addSubcommand(s => s.setName('add').setDescription('Blacklist a user').addUserOption(o => o.setName('user').setDescription('User to blacklist').setRequired(true)).addStringOption(o => o.setName('reason').setDescription('Reason').setRequired(false)))
            .addSubcommand(s => s.setName('remove').setDescription('Remove from blacklist').addUserOption(o => o.setName('user').setDescription('User').setRequired(true)))
            .addSubcommand(s => s.setName('list').setDescription('View blacklisted users'))
            .setDMPermission(false));
    }
    async executeSlash(i) {
        const sub = i.options.getSubcommand();
        const prisma = getPrismaClient();
        if (sub === 'add') {
            const user = i.options.getUser('user', true);
            const reason = i.options.getString('reason') || 'No reason provided';
            await prisma.moderation.upsert({
                where: { userId_guildId: { userId: user.id, guildId: i.guildId } },
                create: { userId: user.id, guildId: i.guildId, giveawayBlacklisted: true },
                update: { giveawayBlacklisted: true },
            }).catch(() => { });
            await i.reply({ content: `✅ **${user.username}** has been blacklisted from all giveaways. Reason: ${reason}`, ephemeral: true });
        }
        else if (sub === 'remove') {
            const user = i.options.getUser('user', true);
            await prisma.moderation.update({ where: { userId_guildId: { userId: user.id, guildId: i.guildId } }, data: { giveawayBlacklisted: false } }).catch(() => { });
            await i.reply({ content: `✅ **${user.username}** removed from giveaway blacklist.`, ephemeral: true });
        }
        else {
            await i.reply({ content: '📋 Giveaway blacklist management is active. Use the subcommands to manage.', ephemeral: true });
        }
    }
    async executePrefix(m, _args) {
        const [action] = _args;
        const target = m.mentions.users.first();
        if (!action || !target) {
            await m.reply('❌ Usage: `p!gblacklist add/remove @user`');
            return;
        }
        const prisma = getPrismaClient();
        if (action === 'add') {
            await prisma.moderation.upsert({ where: { userId_guildId: { userId: target.id, guildId: m.guildId } }, create: { userId: target.id, guildId: m.guildId, giveawayBlacklisted: true }, update: { giveawayBlacklisted: true } }).catch(() => { });
            await m.reply(`✅ **${target.username}** blacklisted from giveaways.`);
        }
        else if (action === 'remove') {
            await prisma.moderation.update({ where: { userId_guildId: { userId: target.id, guildId: m.guildId } }, data: { giveawayBlacklisted: false } }).catch(() => { });
            await m.reply(`✅ **${target.username}** removed from giveaway blacklist.`);
        }
    }
}
export default GiveawayBlacklistCommand;
