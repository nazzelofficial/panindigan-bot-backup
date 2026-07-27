// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class DbvacuumCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'dbvacuum',
            description: 'Show PostgreSQL VACUUM instructions',
            category: 'owner',
            premiumTier: 'free',
            cooldown: 0,
            userPermissions: [],
            botPermissions: [],
            ownerOnly: true,
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['db-vacuum', 'pgvacuum'],
            examples: ['/dbvacuum', 'p!dbvacuum'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const embed = this.buildEmbed();
        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
    async executePrefix(message, _args) {
        const embed = this.buildEmbed();
        await message.reply({ embeds: [embed] });
    }
    buildEmbed() {
        return new EmbedBuilder()
            .setTitle(`${EMOJIS.owner} PostgreSQL VACUUM Instructions`)
            .setColor(COLORS.info)
            .setDescription('VACUUM reclaims storage occupied by dead tuples and updates planner statistics.')
            .addFields({
            name: '🧹 Standard VACUUM',
            value: '```sql\nVACUUM;\n```\nReclaims dead row versions. Non-blocking.',
            inline: false,
        }, {
            name: '🧹 VACUUM ANALYZE',
            value: '```sql\nVACUUM ANALYZE;\n```\nReclaims storage AND updates query planner statistics.',
            inline: false,
        }, {
            name: '🧹 VACUUM FULL (aggressive)',
            value: '```sql\nVACUUM FULL;\n```\n⚠️ Rewrites entire table. Acquires an exclusive lock. Use with caution.',
            inline: false,
        }, {
            name: '🧹 Vacuum Specific Table',
            value: '```sql\nVACUUM ANALYZE "table_name";\n```',
            inline: false,
        }, {
            name: '📋 Via psql CLI',
            value: '```bash\npsql $DATABASE_URL -c "VACUUM ANALYZE;"\n```',
            inline: false,
        }, {
            name: 'ℹ️ AutoVacuum',
            value: 'PostgreSQL runs autovacuum automatically. Manual VACUUM is only needed for large batch deletes or urgent reclamation.',
            inline: false,
        })
            .setFooter({ text: 'PostgreSQL — Storage maintenance' })
            .setTimestamp();
    }
}
export default DbvacuumCommand;
