// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import getPrismaClient from '../../database/postgresql/client.js';
export class DbstatusCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'dbstatus',
            description: 'Show PostgreSQL connection status and latency',
            category: 'owner',
            premiumTier: 'free',
            cooldown: 0,
            userPermissions: [],
            botPermissions: [],
            ownerOnly: true,
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['db-status', 'pgstatus'],
            examples: ['/dbstatus', 'p!dbstatus'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const embed = await this.getStatus();
        await interaction.editReply({ embeds: [embed] });
    }
    async executePrefix(message, _args) {
        const loadingMsg = await message.reply(`${EMOJIS.loading} Checking database status...`);
        const embed = await this.getStatus();
        await loadingMsg.edit({ content: '', embeds: [embed] });
    }
    async getStatus() {
        try {
            const prisma = getPrismaClient();
            const start = Date.now();
            await prisma.$queryRaw `SELECT 1`;
            const latency = Date.now() - start;
            const statusColor = latency < 100 ? COLORS.success : latency < 300 ? COLORS.warning : COLORS.error;
            const statusEmoji = latency < 100 ? EMOJIS.success : latency < 300 ? EMOJIS.warning : EMOJIS.error;
            return new EmbedBuilder()
                .setTitle(`${EMOJIS.owner} PostgreSQL Status`)
                .setColor(statusColor)
                .setDescription(`${statusEmoji} Database is **online** and responding.`)
                .addFields({
                name: '🏓 Latency',
                value: `**${latency}ms**`,
                inline: true,
            }, {
                name: '📊 Status',
                value: latency < 100 ? '🟢 Excellent' : latency < 300 ? '🟡 Moderate' : '🔴 High Latency',
                inline: true,
            }, {
                name: '⏰ Checked At',
                value: `<t:${Math.floor(Date.now() / 1000)}:T>`,
                inline: true,
            })
                .setFooter({ text: 'PostgreSQL connection check via Prisma' })
                .setTimestamp();
        }
        catch (error) {
            return new EmbedBuilder()
                .setTitle(`${EMOJIS.error} PostgreSQL Status`)
                .setColor(COLORS.error)
                .setDescription(`🔴 Database is **offline** or unreachable.\n\`\`\`${error instanceof Error ? error.message : String(error)}\`\`\``)
                .setTimestamp();
        }
    }
}
export default DbstatusCommand;
