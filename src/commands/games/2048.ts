import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, ComponentType, ButtonStyle, ActionRowBuilder, ButtonBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class Game2048Command extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: '2048',
      description: 'Play the 2048 game',
      category: 'games',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['game2048'],
      examples: ['/2048', 'p!2048'],
    };
    super(options);
  }

  private initializeBoard(): number[][] {
    const board = Array(4).fill(null).map(() => Array(4).fill(0));
    this.addRandomTile(board);
    this.addRandomTile(board);
    return board;
  }

  private addRandomTile(board: number[][]): void {
    const emptyCells: [number, number][] = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] === 0) {
          emptyCells.push([i, j]);
        }
      }
    }
    if (emptyCells.length > 0) {
      const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      board[row][col] = Math.random() < 0.9 ? 2 : 4;
    }
  }

  private slide(row: number[]): number[] {
    let arr = row.filter((val) => val !== 0);
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] === arr[i + 1]) {
        arr[i] *= 2;
        arr[i + 1] = 0;
      }
    }
    arr = arr.filter((val) => val !== 0);
    while (arr.length < 4) {
      arr.push(0);
    }
    return arr;
  }

  private moveLeft(board: number[][]): number[][] {
    return board.map((row) => this.slide(row));
  }

  private moveRight(board: number[][]): number[][] {
    return board.map((row) => this.slide(row.reverse()).reverse());
  }

  private moveUp(board: number[][]): number[][] {
    const newBoard = Array(4).fill(null).map(() => Array(4).fill(0));
    for (let j = 0; j < 4; j++) {
      const col = board.map((row) => row[j]);
      const newCol = this.slide(col);
      for (let i = 0; i < 4; i++) {
        newBoard[i][j] = newCol[i];
      }
    }
    return newBoard;
  }

  private moveDown(board: number[][]): number[][] {
    const newBoard = Array(4).fill(null).map(() => Array(4).fill(0));
    for (let j = 0; j < 4; j++) {
      const col = board.map((row) => row[j]).reverse();
      const newCol = this.slide(col).reverse();
      for (let i = 0; i < 4; i++) {
        newBoard[i][j] = newCol[i];
      }
    }
    return newBoard;
  }

  private displayBoard(board: number[][]): string {
    return board.map((row) => row.map((cell) => cell === 0 ? '⬜' : cell).join(' ')).join('\n');
  }

  private hasWon(board: number[][]): boolean {
    return board.some((row) => row.some((cell) => cell === 2048));
  }

  private isGameOver(board: number[][]): boolean {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] === 0) return false;
        if (j < 3 && board[i][j] === board[i][j + 1]) return false;
        if (i < 3 && board[i][j] === board[i + 1][j]) return false;
      }
    }
    return true;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    let board = this.initializeBoard();
    let score = 0;

    const createButtons = () => {
      const row1 = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder().setCustomId('2048_up').setLabel('⬆️').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId('2048_down').setLabel('⬇️').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId('2048_left').setLabel('⬅️').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId('2048_right').setLabel('➡️').setStyle(ButtonStyle.Primary)
        );
      return [row1];
    };

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} 2048`)
      .setColor(COLORS.info)
      .setDescription(`Score: ${score}\n\n${this.displayBoard(board)}`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed], components: createButtons() });

    const collector = interaction.channel?.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 300000,
    });

    collector?.on('collect', async (i) => {
      const direction = i.customId.split('_')[1];
      let newBoard: number[][];

      switch (direction) {
        case 'up':
          newBoard = this.moveUp(board);
          break;
        case 'down':
          newBoard = this.moveDown(board);
          break;
        case 'left':
          newBoard = this.moveLeft(board);
          break;
        case 'right':
          newBoard = this.moveRight(board);
          break;
        default:
          return;
      }

      if (JSON.stringify(newBoard) !== JSON.stringify(board)) {
        board = newBoard;
        this.addRandomTile(board);
        score += board.flat().reduce((sum, cell) => sum + cell, 0);
      }

      if (this.hasWon(board)) {
        const winEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} You Won!`)
          .setColor(COLORS.success)
          .setDescription(`Final Score: ${score}\n\n${this.displayBoard(board)}`)
          .setTimestamp();

        await i.update({ embeds: [winEmbed], components: [] });
        collector.stop();
      } else if (this.isGameOver(board)) {
        const loseEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Game Over`)
          .setColor(COLORS.error)
          .setDescription(`Final Score: ${score}\n\n${this.displayBoard(board)}`)
          .setTimestamp();

        await i.update({ embeds: [loseEmbed], components: [] });
        collector.stop();
      } else {
        const updateEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} 2048`)
          .setColor(COLORS.info)
          .setDescription(`Score: ${score}\n\n${this.displayBoard(board)}`)
          .setTimestamp();

        await i.update({ embeds: [updateEmbed], components: createButtons() });
      }
    });

    collector?.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Time's Up!`)
          .setColor(COLORS.error)
          .setDescription(`Final Score: ${score}\n\n${this.displayBoard(board)}`)
          .setTimestamp();

        await interaction.editReply({ embeds: [timeoutEmbed], components: [] });
      }
    });
  }

  public async executePrefix(message: Message): Promise<void> {
    let board = this.initializeBoard();
    let score = 0;

    const createButtons = () => {
      const row1 = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder().setCustomId('2048_up').setLabel('⬆️').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId('2048_down').setLabel('⬇️').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId('2048_left').setLabel('⬅️').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId('2048_right').setLabel('➡️').setStyle(ButtonStyle.Primary)
        );
      return [row1];
    };

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} 2048`)
      .setColor(COLORS.info)
      .setDescription(`Score: ${score}\n\n${this.displayBoard(board)}`)
      .setTimestamp();

    await message.reply({ embeds: [embed], components: createButtons() });

    const collector = message.channel.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 300000,
    });

    collector.on('collect', async (i) => {
      const direction = i.customId.split('_')[1];
      let newBoard: number[][];

      switch (direction) {
        case 'up':
          newBoard = this.moveUp(board);
          break;
        case 'down':
          newBoard = this.moveDown(board);
          break;
        case 'left':
          newBoard = this.moveLeft(board);
          break;
        case 'right':
          newBoard = this.moveRight(board);
          break;
        default:
          return;
      }

      if (JSON.stringify(newBoard) !== JSON.stringify(board)) {
        board = newBoard;
        this.addRandomTile(board);
        score += board.flat().reduce((sum, cell) => sum + cell, 0);
      }

      if (this.hasWon(board)) {
        const winEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} You Won!`)
          .setColor(COLORS.success)
          .setDescription(`Final Score: ${score}\n\n${this.displayBoard(board)}`)
          .setTimestamp();

        await i.update({ embeds: [winEmbed], components: [] });
        collector.stop();
      } else if (this.isGameOver(board)) {
        const loseEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Game Over`)
          .setColor(COLORS.error)
          .setDescription(`Final Score: ${score}\n\n${this.displayBoard(board)}`)
          .setTimestamp();

        await i.update({ embeds: [loseEmbed], components: [] });
        collector.stop();
      } else {
        const updateEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} 2048`)
          .setColor(COLORS.info)
          .setDescription(`Score: ${score}\n\n${this.displayBoard(board)}`)
          .setTimestamp();

        await i.update({ embeds: [updateEmbed], components: createButtons() });
      }
    });

    collector.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Time's Up!`)
          .setColor(COLORS.error)
          .setDescription(`Final Score: ${score}\n\n${this.displayBoard(board)}`)
          .setTimestamp();

        await message.edit({ embeds: [timeoutEmbed], components: [] });
      }
    });
  }
}

export default Game2048Command;
