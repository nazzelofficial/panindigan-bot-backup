// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class BlacklistCommand extends BaseCommand {
    constructor() {
        super({ name: 'blacklist', description: 'Blacklist/unblacklist users or guilds (Owner only)', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['ban-global', 'bl'], examples: ['p!blacklist add user 123456789', 'p!blacklist remove guild 987654321', 'p!blacklist list'] });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
            .addSubcommand(s => s.setName('add').setDescription('Add to blacklist').addStringOption(o => o.setName('type').setDescription('user or guild').setRequired(true).addChoices({ name: 'User', value: 'user' }, { name: 'Guild', value: 'guild' })).addStringOption(o => o.setName('id').setDescription('User/Guild ID').setRequired(true)).addStringOption(o => o.setName('reason').setDescription('Reason').setRequired(false)))
            .addSubcommand(s => s.setName('remove').setDescription('Remove from blacklist').addStringOption(o => o.setName('type').setDescription('user or guild').setRequired(true).addChoices({ name: 'User', value: 'user' }, { name: 'Guild', value: 'guild' })).addStringOption(o => o.setName('id').setDescription('User/Guild ID').setRequired(true)))
            .addSubcommand(s => s.setName('list').setDescription('List blacklisted entries').addStringOption(o => o.setName('type').setDescription('user, guild, or all').setRequired(false))));
    }
    async executeSlash(i) {
        const sub = i.options.getSubcommand();
        const prisma = getPrismaClient();
        if (sub === 'add') {
            const type = i.options.getString('type', true);
            const id = i.options.getString('id', true);
            const reason = i.options.getString('reason') || 'No reason provided.';
            await prisma.blacklist.upsert({
                where: { type_entityId: { type, entityId: id } },
                create: { type, entityId: id, reason, blacklistedBy: i.user.id },
                update: { reason, blacklistedBy: i.user.id, blacklistedAt: new Date() },
            });
            await i.reply({ content: `✅ **${type}** \`${id}\` has been blacklisted.\nReason: ${reason}`, ephemeral: true });
        }
        else if (sub === 'remove') {
            const type = i.options.getString('type', true);
            const id = i.options.getString('id', true);
            await prisma.blacklist.deleteMany({ where: { type, entityId: id } });
            await i.reply({ content: `✅ **${type}** \`${id}\` removed from blacklist.`, ephemeral: true });
        }
        else if (sub === 'list') {
            const type = i.options.getString('type') || undefined;
            const entries = await prisma.blacklist.findMany({ where: type && type !== 'all' ? { type } : {}, take: 25 });
            const embed = new EmbedBuilder().setTitle('🚫 Blacklist').setColor(COLORS.error)
                .setDescription(entries.length ? entries.map((e) => `**${e.type}** \`${e.entityId}\` — ${e.reason}`).join('\n') : 'Empty blacklist.')
                .setTimestamp();
            await i.reply({ embeds: [embed], ephemeral: true });
        }
    }
    async executePrefix(m, _args) {
        await m.reply('Please use `/blacklist` slash commands.');
    }
}
export default BlacklistCommand;
