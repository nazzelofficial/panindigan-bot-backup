import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class DbmigrateCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'dbmigrate',
      description: 'Show database migration instructions',
      category: 'owner',
      premiumTier: 'free',
      cooldown: 0,
      userPermissions: [],
      botPermissions: [],
      ownerOnly: true,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['db-migrate', 'pgmigrate'],
      examples: ['/dbmigrate', 'p!dbmigrate'],
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
      .setTitle(`${EMOJIS.owner} Database Migration Instructions`)
      .setColor(COLORS.info)
      .setDescription('Use Prisma migrations to apply schema changes to the database.')
      .addFields(
        {
          name: '🚀 Apply Pending Migrations (production)',
          value: '```bash\nnpx prisma migrate deploy\n```',
          inline: false,
        },
        {
          name: '🛠️ Create a New Migration (development)',
          value: '```bash\nnpx prisma migrate dev --name migration_name\n```',
          inline: false,
        },
        {
          name: '🔄 Reset Database (dev only — destroys all data)',
          value: '```bash\nnpx prisma migrate reset\n```',
          inline: false,
        },
        {
          name: '📋 Check Migration Status',
          value: '```bash\nnpx prisma migrate status\n```',
          inline: false,
        },
        {
          name: '🔍 Regenerate Prisma Client',
          value: '```bash\nnpx prisma generate\n```',
          inline: false,
        },
        {
          name: '⚠️ Important Notes',
          value: '• Always run `npx prisma migrate deploy` after pulling new code\n• Never run `migrate reset` in production\n• Ensure `DATABASE_URL` is set before running any migration command',
          inline: false,
        },
      )
      .setFooter({ text: 'Prisma ORM — Schema management made easy' })
      .setTimestamp();
  }
}

export default DbmigrateCommand;
