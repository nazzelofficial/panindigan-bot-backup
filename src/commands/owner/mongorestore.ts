import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class MongorestoreCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'mongorestore',
      description: 'Show MongoDB restore warning and instructions',
      category: 'owner',
      premiumTier: 'free',
      cooldown: 0,
      userPermissions: [],
      botPermissions: [],
      ownerOnly: true,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['mongo-restore', 'mdbrestore'],
      examples: ['/mongorestore', 'p!mongorestore'],
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
      .setTitle(`${EMOJIS.warning} MongoDB Restore Instructions`)
      .setColor(COLORS.warning)
      .setDescription('⚠️ **WARNING**: Restoring will merge or overwrite existing data. Make sure you have a current backup.')
      .addFields(
        {
          name: '🔄 Restore from Directory',
          value: '```bash\nmongorestore --uri="$MONGODB_URI" ./backup_directory\n```',
          inline: false,
        },
        {
          name: '🔄 Restore from Compressed Archive',
          value: '```bash\nmongorestore --uri="$MONGODB_URI" --archive=backup.gz --gzip\n```',
          inline: false,
        },
        {
          name: '🔄 Restore with Drop (replaces existing)',
          value: '```bash\nmongorestore --uri="$MONGODB_URI" --drop --archive=backup.gz --gzip\n```',
          inline: false,
        },
        {
          name: '🔄 Restore Specific Collection',
          value: '```bash\nmongorestore --uri="$MONGODB_URI" --collection=ai_conversations --drop ./backup/dbname/ai_conversations.bson\n```',
          inline: false,
        },
        {
          name: '📋 Steps Before Restoring',
          value: '1. Stop the bot to prevent active writes\n2. Take a fresh backup of current data\n3. Run the restore command\n4. Verify data integrity\n5. Restart the bot',
          inline: false,
        },
      )
      .setFooter({ text: '⚠️ This action may be irreversible — proceed with caution' })
      .setTimestamp();
  }
}

export default MongorestoreCommand;
