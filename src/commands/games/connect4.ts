// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, ComponentType, ButtonStyle, ActionRowBuilder, ButtonBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class Connect4Command extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'connect4',
      description: 'Play Connect 4 against another user',
      category: 'games',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['connectfour', 'c4'],
      examples: ['/connect4 @user', 'p!connect4 @user'],
    };
    super(options);
  }

  private board: string[][] = Array(6).fill(null).map(() => Array(7).fill('⬜'));
  private currentPlayer = '🔴';
  private gameOver = false;

  private initializeBoard(): void {
    this.board = Array(6).fill(null).map(() => Array(7).fill('⬜'));
    this.currentPlayer = '🔴';
    this.gameOver = false;
  }

  private displayBoard(): string {
    return this.board.map((row) => row.join('')).join('\n');
  }

  private dropPiece(col: number): boolean {
    for (let row = 5; row >= 0; row--) {
      if (this.board[row][col] === '⬜') {
        this.board[row][col] = this.currentPlayer;
        return true;
      }
    }
    return false;
  }

  private checkWinner(): string | null {
    const player = this.currentPlayer;

    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 4; col++) {
        if (
          this.board[row][col] === player &&
          this.board[row][col + 1] === player &&
          this.board[row][col + 2] === player &&
          this.board[row][col + 3] === player
        ) {
          return player;
        }
      }
    }

    for (let col = 0; col < 7; col++) {
      for (let row = 0; row < 3; row++) {
        if (
          this.board[row][col] === player &&
          this.board[row + 1][col] === player &&
          this.board[row + 2][col] === player &&
          this.board[row + 3][col] === player
        ) {
          return player;
        }
      }
    }

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        if (
          this.board[row][col] === player &&
          this.board[row + 1][col + 1] === player &&
          this.board[row + 2][col + 2] === player &&
          this.board[row + 3][col + 3] === player
        ) {
          return player;
        }
      }
    }

    for (let row = 3; row < 6; row++) {
      for (let col = 0; col < 4; col++) {
        if (
          this.board[row][col] === player &&
          this.board[row - 1][col + 1] === player &&
          this.board[row - 2][col + 2] === player &&
          this.board[row - 3][col + 3] === player
        ) {
          return player;
        }
      }
    }

    return null;
  }

  private isBoardFull(): boolean {
    return this.board[0].every((cell) => cell !== '⬜');
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const opponent = interaction.options.getUser('user');

    if (!opponent || opponent.id === interaction.user.id) {
      await interaction.reply({ content: '❌ Please mention another user to play against.', ephemeral: true });
      return;
    }

    this.initializeBoard();
    const players = { '🔴': interaction.user.id, '🟡': opponent.id };

    const createButtons = () => {
      const row = new ActionRowBuilder<ButtonBuilder>();
      for (let i = 0; i < 7; i++) {
        row.addComponents(
          new ButtonBuilder()
            .setCustomId(`c4_${i}`)
            .setLabel((i + 1).toString())
            .setStyle(ButtonStyle.Primary)
        );
      }
      return row;
    };

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Connect 4`)
      .setColor(COLORS.info)
      .setDescription(`${interaction.user} (🔴) vs ${opponent} (🟡)\n\n${this.displayBoard()}\n\nCurrent turn: ${this.currentPlayer === '🔴' ? interaction.user : opponent}`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed], components: [createButtons()] });

    const collector = interaction.channel?.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 300000,
    });

    collector?.on('collect', async (i) => {
      if (i.user.id !== players[this.currentPlayer]) {
        await i.reply({ content: "It's not your turn!", ephemeral: true });
        return;
      }

      const col = parseInt(i.customId.split('_')[1]);

      if (!this.dropPiece(col)) {
        await i.reply({ content: 'This column is full!', ephemeral: true });
        return;
      }

      const winner = this.checkWinner();

      if (winner) {
        const winnerUser = await interaction.client.users.fetch(players[winner]);
        const winEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} ${winnerUser.tag} Wins!`)
          .setColor(COLORS.success)
          .setDescription(this.displayBoard())
          .setTimestamp();

        await i.update({ embeds: [winEmbed], components: [] });
        collector.stop();
      } else if (this.isBoardFull()) {
        const tieEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} It's a Tie!`)
          .setColor(COLORS.info)
          .setDescription(this.displayBoard())
          .setTimestamp();

        await i.update({ embeds: [tieEmbed], components: [] });
        collector.stop();
      } else {
        this.currentPlayer = this.currentPlayer === '🔴' ? '🟡' : '🔴';
        const updateEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} Connect 4`)
          .setColor(COLORS.info)
          .setDescription(`${interaction.user} (🔴) vs ${opponent} (🟡)\n\n${this.displayBoard()}\n\nCurrent turn: ${this.currentPlayer === '🔴' ? interaction.user : opponent}`)
          .setTimestamp();

        await i.update({ embeds: [updateEmbed], components: [createButtons()] });
      }
    });

    collector?.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Game Timed Out`)
          .setColor(COLORS.error)
          .setDescription('No one made a move in time.')
          .setTimestamp();

        await interaction.editReply({ embeds: [timeoutEmbed], components: [] });
      }
    });
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const opponent = message.mentions.users.first();

    if (!opponent || opponent.id === message.author.id) {
      await message.reply('❌ Please mention another user to play against.');
      return;
    }

    this.initializeBoard();
    const players = { '🔴': message.author.id, '🟡': opponent.id };

    const createButtons = () => {
      const row = new ActionRowBuilder<ButtonBuilder>();
      for (let i = 0; i < 7; i++) {
        row.addComponents(
          new ButtonBuilder()
            .setCustomId(`c4_${i}`)
            .setLabel((i + 1).toString())
            .setStyle(ButtonStyle.Primary)
        );
      }
      return row;
    };

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Connect 4`)
      .setColor(COLORS.info)
      .setDescription(`${message.author} (🔴) vs ${opponent} (🟡)\n\n${this.displayBoard()}\n\nCurrent turn: ${this.currentPlayer === '🔴' ? message.author : opponent}`)
      .setTimestamp();

    await message.reply({ embeds: [embed], components: [createButtons()] });

    const collector = message.channel.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 300000,
    });

    collector.on('collect', async (i) => {
      if (i.user.id !== players[this.currentPlayer]) {
        await i.reply({ content: "It's not your turn!", ephemeral: true });
        return;
      }

      const col = parseInt(i.customId.split('_')[1]);

      if (!this.dropPiece(col)) {
        await i.reply({ content: 'This column is full!', ephemeral: true });
        return;
      }

      const winner = this.checkWinner();

      if (winner) {
        const winnerUser = await message.client.users.fetch(players[winner]);
        const winEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} ${winnerUser.tag} Wins!`)
          .setColor(COLORS.success)
          .setDescription(this.displayBoard())
          .setTimestamp();

        await i.update({ embeds: [winEmbed], components: [] });
        collector.stop();
      } else if (this.isBoardFull()) {
        const tieEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} It's a Tie!`)
          .setColor(COLORS.info)
          .setDescription(this.displayBoard())
          .setTimestamp();

        await i.update({ embeds: [tieEmbed], components: [] });
        collector.stop();
      } else {
        this.currentPlayer = this.currentPlayer === '🔴' ? '🟡' : '🔴';
        const updateEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} Connect 4`)
          .setColor(COLORS.info)
          .setDescription(`${message.author} (🔴) vs ${opponent} (🟡)\n\n${this.displayBoard()}\n\nCurrent turn: ${this.currentPlayer === '🔴' ? message.author : opponent}`)
          .setTimestamp();

        await i.update({ embeds: [updateEmbed], components: [createButtons()] });
      }
    });

    collector.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Game Timed Out`)
          .setColor(COLORS.error)
          .setDescription('No one made a move in time.')
          .setTimestamp();

        await message.edit({ embeds: [timeoutEmbed], components: [] });
      }
    });
  }
}

export default Connect4Command;
