// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class DbvacuumCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
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
      .setTitle(`${EMOJIS.owner} PostgreSQL VACUUM Instructions`)
      .setColor(COLORS.info)
      .setDescription('VACUUM reclaims storage occupied by dead tuples and updates planner statistics.')
      .addFields(
        {
          name: '🧹 Standard VACUUM',
          value: '```sql\nVACUUM;\n```\nReclaims dead row versions. Non-blocking.',
          inline: false,
        },
        {
          name: '🧹 VACUUM ANALYZE',
          value: '```sql\nVACUUM ANALYZE;\n```\nReclaims storage AND updates query planner statistics.',
          inline: false,
        },
        {
          name: '🧹 VACUUM FULL (aggressive)',
          value: '```sql\nVACUUM FULL;\n```\n⚠️ Rewrites entire table. Acquires an exclusive lock. Use with caution.',
          inline: false,
        },
        {
          name: '🧹 Vacuum Specific Table',
          value: '```sql\nVACUUM ANALYZE "table_name";\n```',
          inline: false,
        },
        {
          name: '📋 Via psql CLI',
          value: '```bash\npsql $DATABASE_URL -c "VACUUM ANALYZE;"\n```',
          inline: false,
        },
        {
          name: 'ℹ️ AutoVacuum',
          value: 'PostgreSQL runs autovacuum automatically. Manual VACUUM is only needed for large batch deletes or urgent reclamation.',
          inline: false,
        },
      )
      .setFooter({ text: 'PostgreSQL — Storage maintenance' })
      .setTimestamp();
  }
}

export default DbvacuumCommand;
