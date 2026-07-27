// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class ShipCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'ship',
      description: 'Ship two users together',
      category: 'fun',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['shipname', 'relationship'],
      examples: ['/ship @user1 @user2', 'p!ship @user1 @user2'],
    };
    super(options);
  }

  private calculateShipPercentage(): number {
    return Math.floor(Math.random() * 100) + 1;
  }

  private getShipDescription(percentage: number): string {
    if (percentage >= 90) return 'Perfect match! 💕';
    if (percentage >= 75) return 'Great match! 💖';
    if (percentage >= 60) return 'Good match! 💗';
    if (percentage >= 45) return 'Decent match! 💓';
    if (percentage >= 30) return 'Could work... 💔';
    return 'Not meant to be 💔';
  }

  private generateShipName(name1: string, name2: string): string {
    const mid1 = Math.ceil(name1.length / 2);
    const mid2 = Math.ceil(name2.length / 2);
    return name1.slice(0, mid1) + name2.slice(mid2);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const user1 = interaction.options.getUser('user1') || interaction.user;
    const user2 = interaction.options.getUser('user2') || interaction.user;

    const percentage = this.calculateShipPercentage();
    const shipName = this.generateShipName(user1.username, user2.username);
    const description = this.getShipDescription(percentage);

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 💕 Ship Calculator`)
      .setColor(COLORS.info)
      .setDescription(`${user1.username} ❤️ ${user2.username}`)
      .addFields([
        { name: 'Ship Name', value: shipName, inline: true },
        { name: 'Compatibility', value: `${percentage}%`, inline: true },
        { name: 'Verdict', value: description, inline: false },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const mentions = message.mentions.users;
    const user1 = mentions.first() || message.author;
    const user2 = mentions.last() || message.author;

    const percentage = this.calculateShipPercentage();
    const shipName = this.generateShipName(user1.username, user2.username);
    const description = this.getShipDescription(percentage);

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 💕 Ship Calculator`)
      .setColor(COLORS.info)
      .setDescription(`${user1.username} ❤️ ${user2.username}`)
      .addFields([
        { name: 'Ship Name', value: shipName, inline: true },
        { name: 'Compatibility', value: `${percentage}%`, inline: true },
        { name: 'Verdict', value: description, inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default ShipCommand;
