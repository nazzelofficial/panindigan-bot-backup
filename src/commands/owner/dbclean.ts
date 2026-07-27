// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import getPrismaClient from '../../database/postgresql/client.js';

export class DbcleanCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'dbclean',
      description: 'Clean expired data from the PostgreSQL database',
      category: 'owner',
      premiumTier: 'free',
      cooldown: 0,
      userPermissions: [],
      botPermissions: [],
      ownerOnly: true,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['db-clean', 'pgclean'],
      examples: ['/dbclean', 'p!dbclean'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });
    const embed = await this.runClean();
    await interaction.editReply({ embeds: [embed] });
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const loadingMsg = await message.reply(`${EMOJIS.loading} Cleaning expired data...`);
    const embed = await this.runClean();
    await loadingMsg.edit({ content: '', embeds: [embed] });
  }

  private async runClean(): Promise<EmbedBuilder> {
    try {
      const prisma = getPrismaClient();
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 90);

      const result = await prisma.moderationCase.deleteMany({
        where: {
          createdAt: {
            lt: cutoff,
          },
        },
      });

      return new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Database Cleanup Complete`)
        .setColor(COLORS.success)
        .setDescription('Expired data has been removed from the database.')
        .addFields(
          {
            name: '🗑️ Moderation Cases Deleted',
            value: `**${result.count}** cases older than 90 days`,
            inline: true,
          },
          {
            name: '📅 Cutoff Date',
            value: `<t:${Math.floor(cutoff.getTime() / 1000)}:D>`,
            inline: true,
          },
        )
        .setFooter({ text: 'Cleanup completed successfully' })
        .setTimestamp();
    } catch (error) {
      return new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Cleanup Failed`)
        .setColor(COLORS.error)
        .setDescription(`An error occurred during cleanup:\n\`\`\`${error instanceof Error ? error.message : String(error)}\`\`\``)
        .setTimestamp();
    }
  }
}

export default DbcleanCommand;
