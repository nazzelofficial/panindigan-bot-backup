// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import getPrismaClient from '../../database/postgresql/client.js';
export class DbtablesCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'dbtables',
            description: 'List all PostgreSQL tables with their sizes',
            category: 'owner',
            premiumTier: 'free',
            cooldown: 0,
            userPermissions: [],
            botPermissions: [],
            ownerOnly: true,
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['db-tables', 'pgtables'],
            examples: ['/dbtables', 'p!dbtables'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const embed = await this.getTables();
        await interaction.editReply({ embeds: [embed] });
    }
    async executePrefix(message, _args) {
        const loadingMsg = await message.reply(`${EMOJIS.loading} Fetching tables...`);
        const embed = await this.getTables();
        await loadingMsg.edit({ content: '', embeds: [embed] });
    }
    async getTables() {
        try {
            const prisma = getPrismaClient();
            const rows = await prisma.$queryRaw `
        SELECT tablename, pg_size_pretty(pg_total_relation_size(tablename::regclass)) as size
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY pg_total_relation_size(tablename::regclass) DESC
      `;
            if (rows.length === 0) {
                return new EmbedBuilder()
                    .setTitle(`${EMOJIS.info} Database Tables`)
                    .setColor(COLORS.warning)
                    .setDescription('No tables found in the public schema.')
                    .setTimestamp();
            }
            const tableList = rows
                .map((row, i) => `\`${(i + 1).toString().padStart(2, '0')}.\` **${row.tablename}** — ${row.size}`)
                .join('\n');
            return new EmbedBuilder()
                .setTitle(`${EMOJIS.owner} PostgreSQL Tables`)
                .setColor(COLORS.default)
                .setDescription(tableList.length > 4000 ? tableList.slice(0, 4000) + '\n...' : tableList)
                .addFields({
                name: '📊 Total Tables',
                value: `**${rows.length}**`,
                inline: true,
            })
                .setFooter({ text: 'Schema: public' })
                .setTimestamp();
        }
        catch (error) {
            return new EmbedBuilder()
                .setTitle(`${EMOJIS.error} Failed to Fetch Tables`)
                .setColor(COLORS.error)
                .setDescription(`\`\`\`${error instanceof Error ? error.message : String(error)}\`\`\``)
                .setTimestamp();
        }
    }
}
export default DbtablesCommand;
