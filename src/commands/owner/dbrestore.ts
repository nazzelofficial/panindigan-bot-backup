import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class DbrestoreCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'dbrestore',
      description: 'Show database restore warning and instructions',
      category: 'owner',
      premiumTier: 'free',
      cooldown: 0,
      userPermissions: [],
      botPermissions: [],
      ownerOnly: true,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['db-restore', 'pgrestore'],
      examples: ['/dbrestore', 'p!dbrestore'],
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
      .setTitle(`${EMOJIS.warning} PostgreSQL Restore Instructions`)
      .setColor(COLORS.warning)
      .setDescription('⚠️ **WARNING**: Restoring will overwrite existing data. Make sure you have a current backup before proceeding.')
      .addFields(
        {
          name: '🔄 Restore from Custom Format (.dump)',
          value: '```bash\npg_restore -d $DATABASE_URL -Fc --clean backup.dump\n```',
          inline: false,
        },
        {
          name: '🔄 Restore from SQL Format (.sql)',
          value: '```bash\npsql $DATABASE_URL -f backup.sql\n```',
          inline: false,
        },
        {
          name: '⛔ Drop & Recreate (dangerous)',
          value: '```bash\ndropdb mydb && createdb mydb\npg_restore -d $DATABASE_URL backup.dump\n```',
          inline: false,
        },
        {
          name: '📋 Steps Before Restoring',
          value: '1. Stop the bot to prevent active connections\n2. Take a fresh backup of current state\n3. Run the restore command\n4. Run `npx prisma migrate deploy` to ensure schema is current\n5. Restart the bot',
          inline: false,
        },
      )
      .setFooter({ text: '⚠️ This action is irreversible — proceed with caution' })
      .setTimestamp();
  }
}

export default DbrestoreCommand;
