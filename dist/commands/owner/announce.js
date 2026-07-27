// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
export class AnnounceCommand extends BaseCommand {
    constructor() {
        super({ name: 'announce', description: 'Send a global announcement to all bot servers (Owner only)', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['broadcast', 'globalannounce'], examples: ['p!announce This is a test announcement'] });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
            .addStringOption(o => o.setName('message').setDescription('Announcement content').setRequired(true))
            .addStringOption(o => o.setName('title').setDescription('Embed title').setRequired(false))
            .addStringOption(o => o.setName('type').setDescription('Type').setRequired(false).addChoices({ name: 'Info', value: 'info' }, { name: 'Update', value: 'update' }, { name: 'Warning', value: 'warning' }, { name: 'Maintenance', value: 'maintenance' })));
    }
    async broadcast(client, title, content, type) {
        const colors = { info: COLORS.info, update: COLORS.success, warning: COLORS.warning, maintenance: COLORS.error };
        const embed = new EmbedBuilder()
            .setTitle(`📢 ${title}`)
            .setDescription(content)
            .setColor(colors[type] || COLORS.info)
            .setFooter({ text: 'Panindigan Bot Announcement' })
            .setTimestamp();
        const { getPrismaClient } = await import('../../database/postgresql/client.js');
        const prisma = getPrismaClient();
        const guilds = await prisma.guild.findMany({ where: { announcementChannelId: { not: null } }, select: { guildId: true, announcementChannelId: true } });
        let sent = 0;
        let failed = 0;
        await Promise.allSettled(guilds.map(async (g) => {
            try {
                const ch = client.channels.cache.get(g.announcementChannelId);
                if (ch?.isTextBased()) {
                    await ch.send({ embeds: [embed] });
                    sent++;
                }
            }
            catch {
                failed++;
            }
        }));
        return `✅ Announcement sent to ${sent} servers (${failed} failed).`;
    }
    async executeSlash(i) {
        const content = i.options.getString('message', true);
        const title = i.options.getString('title') || 'Announcement';
        const type = i.options.getString('type') || 'info';
        await i.deferReply({ ephemeral: true });
        const result = await this.broadcast(i.client, title, content, type);
        await i.editReply({ content: result });
    }
    async executePrefix(m, _args) {
        const content = _args.join(' ');
        if (!content) {
            await m.reply('❌ Provide announcement content.');
            return;
        }
        const result = await this.broadcast(m.client, 'Announcement', content, 'info');
        await m.reply(result);
    }
}
export default AnnounceCommand;
