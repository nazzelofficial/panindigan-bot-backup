// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { connectMongoDB } from '../../database/mongodb/client.js';

export class MongocleanCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'mongoclean',
      description: 'Clean expired MongoDB documents (AI conversations older than 30 days)',
      category: 'owner',
      premiumTier: 'free',
      cooldown: 0,
      userPermissions: [],
      botPermissions: [],
      ownerOnly: true,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['mongo-clean', 'mdbclean'],
      examples: ['/mongoclean', 'p!mongoclean'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });
    const embed = await this.runClean();
    await interaction.editReply({ embeds: [embed] });
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const loadingMsg = await message.reply(`${EMOJIS.loading} Cleaning expired MongoDB documents...`);
    const embed = await this.runClean();
    await loadingMsg.edit({ content: '', embeds: [embed] });
  }

  private async runClean(): Promise<EmbedBuilder> {
    try {
      const db = await connectMongoDB();
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);

      const result = await db.collection('ai_conversations').deleteMany({
        createdAt: { $lt: cutoff },
      });

      return new EmbedBuilder()
        .setTitle(`${EMOJIS.success} MongoDB Cleanup Complete`)
        .setColor(COLORS.success)
        .setDescription('Expired AI conversation documents have been removed.')
        .addFields(
          {
            name: '🗑️ Documents Deleted',
            value: `**${result.deletedCount}** conversation(s) older than 30 days`,
            inline: true,
          },
          {
            name: '📁 Collection',
            value: '`ai_conversations`',
            inline: true,
          },
          {
            name: '📅 Cutoff Date',
            value: `<t:${Math.floor(cutoff.getTime() / 1000)}:D>`,
            inline: true,
          },
        )
        .setFooter({ text: 'MongoDB cleanup completed successfully' })
        .setTimestamp();
    } catch (error) {
      return new EmbedBuilder()
        .setTitle(`${EMOJIS.error} MongoDB Cleanup Failed`)
        .setColor(COLORS.error)
        .setDescription(`\`\`\`${error instanceof Error ? error.message : String(error)}\`\`\``)
        .setTimestamp();
    }
  }
}

export default MongocleanCommand;
