import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class NewCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'new',
      description: 'View recently added commands and features',
      category: 'help',
      cooldown: 10,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['recent', 'latest'],
      examples: ['/new', 'p!new'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await this.showNew(interaction);
  }

  public async executePrefix(message: Message): Promise<void> {
    await this.showNew(message);
  }

  private async showNew(interaction: ChatInputCommandInteraction | Message): Promise<void> {
    const client = interaction.client;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.success} New in Panindigan v0.1`)
      .setDescription('Latest additions to the bot')
      .setColor(COLORS.success)
      .addFields([
        { name: '🤖 AI System', value: '• Multi-provider AI (OpenAI, Anthropic, Gemini, Groq)\n• Conversation memory\n• Image generation', inline: false },
        { name: '🎵 Music v4', value: '• Lavalink v4 integration\n• Shoukaku + Kazagumo\n• Advanced audio effects', inline: false },
        { name: '💎 Premium Tiers', value: '• Bronze, Silver, Gold, Diamond\n• One-time permanent purchase\n• 7-day free trial', inline: false },
        { name: '🗄️ Dual Database', value: '• PostgreSQL for structured data\n• MongoDB for flexible documents\n• Redis for caching', inline: false },
        { name: '🔷 Sharding', value: '• Auto-sharding support\n• Per-shard logging\n• Load balancing', inline: false },
      ])
      .setFooter({ text: 'Version 0.1 • Initial Release' })
      .setTimestamp();

    if (interaction instanceof ChatInputCommandInteraction) {
      await interaction.reply({ embeds: [embed] });
    } else {
      await interaction.reply({ embeds: [embed] });
    }
  }
}

export default NewCommand;
