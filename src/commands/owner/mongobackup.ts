import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class MongobackupCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'mongobackup',
      description: 'Show MongoDB backup instructions using mongodump',
      category: 'owner',
      premiumTier: 'free',
      cooldown: 0,
      userPermissions: [],
      botPermissions: [],
      ownerOnly: true,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['mongo-backup', 'mdbbackup'],
      examples: ['/mongobackup', 'p!mongobackup'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const embed = this.buildEmbed();
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const embed = this.buildEmbed();
    await message.reply({ embeds: [embed] });
  }

  private buildEmbed(): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle(`${EMOJIS.owner} MongoDB Backup Instructions`)
      .setColor(COLORS.info)
      .setDescription('Use `mongodump` to create a backup of your MongoDB database.')
      .addFields(
        {
          name: '📦 Full Backup',
          value: '```bash\nmongodump --uri="$MONGODB_URI" --out=./backup_$(date +%Y%m%d_%H%M%S)\n```',
          inline: false,
        },
        {
          name: '📦 Backup as Archive (compressed)',
          value: '```bash\nmongodump --uri="$MONGODB_URI" --archive=backup_$(date +%Y%m%d).gz --gzip\n```',
          inline: false,
        },
        {
          name: '📦 Backup Specific Collection',
          value: '```bash\nmongodump --uri="$MONGODB_URI" --collection=ai_conversations --out=./backup\n```',
          inline: false,
        },
        {
          name: '☁️ Upload to S3 (optional)',
          value: '```bash\naws s3 cp backup.gz s3://your-bucket/mongo-backups/\n```',
          inline: false,
        },
        {
          name: '⏰ Automate with cron',
          value: '```bash\n0 4 * * * mongodump --uri="$MONGODB_URI" --archive=/backups/mongo_$(date +%Y%m%d).gz --gzip\n```',
          inline: false,
        },
      )
      .setFooter({ text: 'Ensure MONGODB_URI env variable is set before running' })
      .setTimestamp();
  }
}

export default MongobackupCommand;
