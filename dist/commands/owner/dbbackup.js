// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class DbbackupCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'dbbackup',
            description: 'Show database backup instructions',
            category: 'owner',
            premiumTier: 'free',
            cooldown: 0,
            userPermissions: [],
            botPermissions: [],
            ownerOnly: true,
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['db-backup', 'pgbackup'],
            examples: ['/dbbackup', 'p!dbbackup'],
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
            .setTitle(`${EMOJIS.owner} PostgreSQL Backup Instructions`)
            .setColor(COLORS.info)
            .setDescription('Run the following command on your server to create a database backup:')
            .addFields({
            name: '📦 Full Backup Command',
            value: '```bash\npg_dump $DATABASE_URL -Fc -f backup_$(date +%Y%m%d_%H%M%S).dump\n```',
            inline: false,
        }, {
            name: '📦 SQL Format Backup',
            value: '```bash\npg_dump $DATABASE_URL -f backup_$(date +%Y%m%d_%H%M%S).sql\n```',
            inline: false,
        }, {
            name: '☁️ Upload to S3 (optional)',
            value: '```bash\naws s3 cp backup.dump s3://your-bucket/backups/\n```',
            inline: false,
        }, {
            name: '⏰ Automate with cron',
            value: '```bash\n0 3 * * * pg_dump $DATABASE_URL -Fc -f /backups/db_$(date +%Y%m%d).dump\n```',
            inline: false,
        })
            .setFooter({ text: 'Ensure DATABASE_URL env variable is set before running' })
            .setTimestamp();
    }
}
export default DbbackupCommand;
