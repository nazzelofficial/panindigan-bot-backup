import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, ComponentType, ButtonStyle, ActionRowBuilder, ButtonBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class MinesweeperCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'minesweeper',
      description: 'Play a minesweeper game',
      category: 'games',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['mines'],
      examples: ['/minesweeper', 'p!minesweeper'],
    };
    super(options);
  }

  private gridSize = 5;
  private mineCount = 5;
  private board: { revealed: boolean; mine: boolean; adjacent: number }[][] = [];
  private gameOver = false;
  private won = false;

  private initializeBoard(): void {
    this.board = Array(this.gridSize).fill(null).map(() =>
      Array(this.gridSize).fill(null).map(() => ({ revealed: false, mine: false, adjacent: 0 }))
    );

    let minesPlaced = 0;
    while (minesPlaced < this.mineCount) {
      const row = Math.floor(Math.random() * this.gridSize);
      const col = Math.floor(Math.random() * this.gridSize);
      if (!this.board[row][col].mine) {
        this.board[row][col].mine = true;
        minesPlaced++;
      }
    }

    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        if (!this.board[row][col].mine) {
          let adjacent = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const newRow = row + dr;
              const newCol = col + dc;
              if (
                newRow >= 0 &&
                newRow < this.gridSize &&
                newCol >= 0 &&
                newCol < this.gridSize &&
                this.board[newRow][newCol].mine
              ) {
                adjacent++;
              }
            }
          }
          this.board[row][col].adjacent = adjacent;
        }
      }
    }

    this.gameOver = false;
    this.won = false;
  }

  private displayBoard(): string {
    return this.board
      .map((row) =>
        row.map((cell) => {
          if (cell.revealed) {
            if (cell.mine) return '💣';
            return cell.adjacent > 0 ? cell.adjacent.toString() : '⬜';
          }
          return '❓';
        }).join(' ')
      )
      .join('\n');
  }

  private revealCell(row: number, col: number): void {
    if (row < 0 || row >= this.gridSize || col < 0 || col >= this.gridSize) return;
    if (this.board[row][col].revealed) return;

    this.board[row][col].revealed = true;

    if (this.board[row][col].mine) {
      this.gameOver = true;
      return;
    }

    if (this.board[row][col].adjacent === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          this.revealCell(row + dr, col + dc);
        }
      }
    }
  }

  private checkWin(): boolean {
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        if (!this.board[row][col].mine && !this.board[row][col].revealed) {
          return false;
        }
      }
    }
    return true;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    this.initializeBoard();

    const createButtons = () => {
      const rows: ActionRowBuilder<ButtonBuilder>[] = [];
      for (let i = 0; i < this.gridSize; i++) {
        const row = new ActionRowBuilder<ButtonBuilder>();
        for (let j = 0; j < this.gridSize; j++) {
          const label = this.board[i][j].revealed
            ? this.board[i][j].mine
              ? '💣'
              : this.board[i][j].adjacent > 0
              ? this.board[i][j].adjacent.toString()
              : '⬜'
            : '❓';
          const style = this.board[i][j].revealed
            ? this.board[i][j].mine
              ? ButtonStyle.Danger
              : ButtonStyle.Secondary
            : ButtonStyle.Primary;
          row.addComponents(
            new ButtonBuilder()
              .setCustomId(`ms_${i}_${j}`)
              .setLabel(label)
              .setStyle(style)
              .setDisabled(this.board[i][j].revealed || this.gameOver)
          );
        }
        rows.push(row);
      }
      return rows;
    };

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Minesweeper`)
      .setColor(COLORS.info)
      .setDescription(`Mines: ${this.mineCount}\n\n${this.displayBoard()}`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed], components: createButtons() });

    const collector = interaction.channel?.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 300000,
    });

    collector?.on('collect', async (i) => {
      const [row, col] = i.customId.split('_').slice(1).map(Number);

      this.revealCell(row, col);

      if (this.gameOver) {
        for (let r = 0; r < this.gridSize; r++) {
          for (let c = 0; c < this.gridSize; c++) {
            this.board[r][c].revealed = true;
          }
        }
        const loseEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Game Over`)
          .setColor(COLORS.error)
          .setDescription(`You hit a mine!\n\n${this.displayBoard()}`)
          .setTimestamp();

        await i.update({ embeds: [loseEmbed], components: createButtons() });
        collector.stop();
      } else if (this.checkWin()) {
        this.won = true;
        for (let r = 0; r < this.gridSize; r++) {
          for (let c = 0; c < this.gridSize; c++) {
            this.board[r][c].revealed = true;
          }
        }
        const winEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} You Won!`)
          .setColor(COLORS.success)
          .setDescription(`You cleared all mines!\n\n${this.displayBoard()}`)
          .setTimestamp();

        await i.update({ embeds: [winEmbed], components: createButtons() });
        collector.stop();
      } else {
        const updateEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} Minesweeper`)
          .setColor(COLORS.info)
          .setDescription(`Mines: ${this.mineCount}\n\n${this.displayBoard()}`)
          .setTimestamp();

        await i.update({ embeds: [updateEmbed], components: createButtons() });
      }
    });

    collector?.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Time's Up!`)
          .setColor(COLORS.error)
          .setDescription('Game timed out.')
          .setTimestamp();

        await interaction.editReply({ embeds: [timeoutEmbed], components: [] });
      }
    });
  }

  public async executePrefix(message: Message): Promise<void> {
    this.initializeBoard();

    const createButtons = () => {
      const rows: ActionRowBuilder<ButtonBuilder>[] = [];
      for (let i = 0; i < this.gridSize; i++) {
        const row = new ActionRowBuilder<ButtonBuilder>();
        for (let j = 0; j < this.gridSize; j++) {
          const label = this.board[i][j].revealed
            ? this.board[i][j].mine
              ? '💣'
              : this.board[i][j].adjacent > 0
              ? this.board[i][j].adjacent.toString()
              : '⬜'
            : '❓';
          const style = this.board[i][j].revealed
            ? this.board[i][j].mine
              ? ButtonStyle.Danger
              : ButtonStyle.Secondary
            : ButtonStyle.Primary;
          row.addComponents(
            new ButtonBuilder()
              .setCustomId(`ms_${i}_${j}`)
              .setLabel(label)
              .setStyle(style)
              .setDisabled(this.board[i][j].revealed || this.gameOver)
          );
        }
        rows.push(row);
      }
      return rows;
    };

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Minesweeper`)
      .setColor(COLORS.info)
      .setDescription(`Mines: ${this.mineCount}\n\n${this.displayBoard()}`)
      .setTimestamp();

    await message.reply({ embeds: [embed], components: createButtons() });

    const collector = message.channel.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 300000,
    });

    collector.on('collect', async (i) => {
      const [row, col] = i.customId.split('_').slice(1).map(Number);

      this.revealCell(row, col);

      if (this.gameOver) {
        for (let r = 0; r < this.gridSize; r++) {
          for (let c = 0; c < this.gridSize; c++) {
            this.board[r][c].revealed = true;
          }
        }
        const loseEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Game Over`)
          .setColor(COLORS.error)
          .setDescription(`You hit a mine!\n\n${this.displayBoard()}`)
          .setTimestamp();

        await i.update({ embeds: [loseEmbed], components: createButtons() });
        collector.stop();
      } else if (this.checkWin()) {
        this.won = true;
        for (let r = 0; r < this.gridSize; r++) {
          for (let c = 0; c < this.gridSize; c++) {
            this.board[r][c].revealed = true;
          }
        }
        const winEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} You Won!`)
          .setColor(COLORS.success)
          .setDescription(`You cleared all mines!\n\n${this.displayBoard()}`)
          .setTimestamp();

        await i.update({ embeds: [winEmbed], components: createButtons() });
        collector.stop();
      } else {
        const updateEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} Minesweeper`)
          .setColor(COLORS.info)
          .setDescription(`Mines: ${this.mineCount}\n\n${this.displayBoard()}`)
          .setTimestamp();

        await i.update({ embeds: [updateEmbed], components: createButtons() });
      }
    });

    collector.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Time's Up!`)
          .setColor(COLORS.error)
          .setDescription('Game timed out.')
          .setTimestamp();

        await message.edit({ embeds: [timeoutEmbed], components: [] });
      }
    });
  }
}

export default MinesweeperCommand;
