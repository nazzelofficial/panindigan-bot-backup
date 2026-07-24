import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class FreeCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'free',
      description: 'View all free commands available without premium',
      category: 'help',
      cooldown: 10,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['freecommands'],
      examples: ['/free', 'p!free'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await this.showFree(interaction);
  }

  public async executePrefix(message: Message): Promise<void> {
    await this.showFree(message);
  }

  private async showFree(interaction: ChatInputCommandInteraction | Message): Promise<void> {
    const client = interaction.client;
    const commands = (client as any).commands;
    
    const freeCommands = commands.filter((cmd: any) => cmd.premiumTier === 'free');

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.success} Free Commands`)
      .setDescription(`Total: ${freeCommands.size} free commands available to everyone`)
      .setColor(COLORS.success)
      .addFields([
        { name: '🆓 Always Available', value: 'These commands are free for all users, no premium required!', inline: false },
        { name: '📊 Categories', value: '• Help & Info\n• Basic Moderation\n• Basic Music\n• Basic Economy\n• Fun Games\n• Basic AI', inline: false },
        { name: '💡 Upgrade for More', value: 'Get premium to unlock 700+ additional commands with advanced features!', inline: false },
      ])
      .setFooter({ text: 'Use /premium to learn about premium tiers' })
      .setTimestamp();

    if (interaction instanceof ChatInputCommandInteraction) {
      await interaction.reply({ embeds: [embed] });
    } else {
      await interaction.reply({ embeds: [embed] });
    }
  }
}

export default FreeCommand;
