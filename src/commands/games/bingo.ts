// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class BingoCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'bingo',
      description: 'Generate a bingo card',
      category: 'games',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['bingocard'],
      examples: ['/bingo', 'p!bingo'],
    };
    super(options);
  }

  private generateCard(): string[][] {
    const numbers = Array.from({ length: 75 }, (_, i) => i + 1);
    const card: string[][] = Array(5).fill(null).map(() => Array(5).fill(''));

    for (let col = 0; col < 5; col++) {
      const min = col * 15 + 1;
      const max = (col + 1) * 15;
      const columnNumbers = numbers.filter((n) => n >= min && n <= max);
      
      for (let row = 0; row < 5; row++) {
        if (col === 2 && row === 2) {
          card[row][col] = 'FREE';
        } else {
          const randomIndex = Math.floor(Math.random() * columnNumbers.length);
          card[row][col] = columnNumbers.splice(randomIndex, 1)[0].toString();
        }
      }
    }

    return card;
  }

  private displayCard(card: string[][]): string {
    const header = 'B  I  N  G  O';
    const rows = card.map((row) => row.map((cell) => cell.padStart(2)).join(' '));
    return `${header}\n${rows.join('\n')}`;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const card = this.generateCard();

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Bingo Card`)
      .setColor(COLORS.info)
      .setDescription(`\`\`\`\n${this.displayCard(card)}\n\`\`\``)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const card = this.generateCard();

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Bingo Card`)
      .setColor(COLORS.info)
      .setDescription(`\`\`\`\n${this.displayCard(card)}\n\`\`\``)
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default BingoCommand;
