import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { connectMongoDB } from '../../database/mongodb/client';

export class MongocollectionsCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'mongocollections',
      description: 'List all MongoDB collections with document counts',
      category: 'owner',
      premiumTier: 'free',
      cooldown: 0,
      userPermissions: [],
      botPermissions: [],
      ownerOnly: true,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['mongo-collections', 'mdbcols'],
      examples: ['/mongocollections', 'p!mongocollections'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });
    const embed = await this.listCollections();
    await interaction.editReply({ embeds: [embed] });
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const loadingMsg = await message.reply(`${EMOJIS.loading} Listing collections...`);
    const embed = await this.listCollections();
    await loadingMsg.edit({ content: '', embeds: [embed] });
  }

  private async listCollections(): Promise<EmbedBuilder> {
    try {
      const db = await connectMongoDB();
      const collections = await db.listCollections().toArray();

      if (collections.length === 0) {
        return new EmbedBuilder()
          .setTitle(`${EMOJIS.info} MongoDB Collections`)
          .setColor(COLORS.warning)
          .setDescription('No collections found in the database.')
          .setTimestamp();
      }

      const counts: { name: string; count: number }[] = [];
      for (const col of collections) {
        const count = await db.collection(col.name).countDocuments();
        counts.push({ name: col.name, count });
      }

      counts.sort((a, b) => b.count - a.count);

      const listText = counts
        .map((c, i) => `\`${(i + 1).toString().padStart(2, '0')}.\` **${c.name}** — ${c.count.toLocaleString()} docs`)
        .join('\n');

      const totalDocs = counts.reduce((sum, c) => sum + c.count, 0);

      return new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} MongoDB Collections`)
        .setColor(COLORS.default)
        .setDescription(listText.length > 4000 ? listText.slice(0, 4000) + '\n...' : listText)
        .addFields(
          {
            name: '📁 Total Collections',
            value: `**${collections.length}**`,
            inline: true,
          },
          {
            name: '📄 Total Documents',
            value: `**${totalDocs.toLocaleString()}**`,
            inline: true,
          },
        )
        .setFooter({ text: `Database: ${db.databaseName}` })
        .setTimestamp();
    } catch (error) {
      return new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Failed to List Collections`)
        .setColor(COLORS.error)
        .setDescription(`\`\`\`${error instanceof Error ? error.message : String(error)}\`\`\``)
        .setTimestamp();
    }
  }
}

export default MongocollectionsCommand;
