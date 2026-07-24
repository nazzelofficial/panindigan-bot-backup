import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class DbflushCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'dbflush',
      description: 'Show dangerous warning for flushing a specific database table',
      category: 'owner',
      premiumTier: 'free',
      cooldown: 0,
      userPermissions: [],
      botPermissions: [],
      ownerOnly: true,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['db-flush', 'pgflush'],
      examples: ['/dbflush table_name', 'p!dbflush users'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(opt =>
        opt.setName('table_name')
          .setDescription('The table to flush (truncate)')
          .setRequired(true)
      ) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const tableName = interaction.options.getString('table_name', true);
    const embed = this.buildEmbed(tableName);
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const tableName = args[0];
    if (!tableName) {
      const errEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Missing Argument`)
        .setColor(COLORS.error)
        .setDescription('Please provide a table name.\n**Usage:** `p!dbflush <table_name>`')
        .setTimestamp();
      await message.reply({ embeds: [errEmbed] });
      return;
    }
    const embed = this.buildEmbed(tableName);
    await message.reply({ embeds: [embed] });
  }

  private buildEmbed(tableName: string): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle(`${EMOJIS.warning} ⛔ DANGEROUS OPERATION — Table Flush`)
      .setColor(COLORS.error)
      .setDescription(`You are about to **TRUNCATE** the table \`${tableName}\`.\n\n**This will permanently delete ALL rows in this table.**\nThis action **cannot be undone**.`)
      .addFields(
        {
          name: '🗑️ Target Table',
          value: `\`${tableName}\``,
          inline: true,
        },
        {
          name: '⚠️ Effect',
          value: 'All rows deleted permanently',
          inline: true,
        },
        {
          name: '🛠️ Manual SQL Command',
          value: `\`\`\`sql\nTRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE;\n\`\`\``,
          inline: false,
        },
        {
          name: '📋 Steps to Execute',
          value: '1. Create a full database backup first\n2. Connect to your PostgreSQL instance\n3. Run the SQL command above\n4. Verify the table is empty\n5. Restart the bot if needed',
          inline: false,
        },
      )
      .setFooter({ text: '⛔ This is a destructive operation — ensure you have a backup' })
      .setTimestamp();
  }
}

export default DbflushCommand;
