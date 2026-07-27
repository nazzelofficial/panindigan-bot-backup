// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, ComponentType, ButtonStyle, ActionRowBuilder, ButtonBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class TicTacToeCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'tictactoe',
      description: 'Play tic-tac-toe against another user',
      category: 'games',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['ttt', 'xo'],
      examples: ['/tictactoe @user', 'p!tictactoe @user'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const opponent = interaction.options.getUser('user');

    if (!opponent || opponent.id === interaction.user.id) {
      await interaction.reply({ content: '❌ Please mention another user to play against.', ephemeral: true });
      return;
    }

    const board = Array(9).fill(null);
    let currentPlayer = 'X';
    const players = { X: interaction.user.id, O: opponent.id };

    const displayBoard = () => {
      const emojis = { X: '❌', O: '⭕', null: '⬜' };
      const rows = [];
      for (let i = 0; i < 3; i++) {
        rows.push(board.slice(i * 3, (i + 1) * 3).map((cell) => emojis[cell]).join(' '));
      }
      return rows.join('\n');
    };

    const checkWinner = () => {
      const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6],
      ];
      for (const [a, b, c] of lines) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
          return board[a];
        }
      }
      return board.includes(null) ? null : 'tie';
    };

    const createButtons = () => {
      const row = new ActionRowBuilder<ButtonBuilder>();
      for (let i = 0; i < 9; i++) {
        const label = board[i] || (i + 1).toString();
        const style = board[i] ? ButtonStyle.Secondary : ButtonStyle.Primary;
        row.addComponents(
          new ButtonBuilder()
            .setCustomId(`ttt_${i}`)
            .setLabel(label)
            .setStyle(style)
            .setDisabled(board[i] !== null)
        );
      }
      return row;
    };

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Tic-Tac-Toe`)
      .setColor(COLORS.info)
      .setDescription(`${interaction.user} (X) vs ${opponent} (O)\n\n${displayBoard()}\n\nCurrent turn: ${currentPlayer === 'X' ? interaction.user : opponent}`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed], components: [createButtons()] });

    const collector = interaction.channel?.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 300000,
    });

    collector?.on('collect', async (i) => {
      if (i.user.id !== players[currentPlayer]) {
        await i.reply({ content: "It's not your turn!", ephemeral: true });
        return;
      }

      const index = parseInt(i.customId.split('_')[1]);
      board[index] = currentPlayer;

      const winner = checkWinner();

      if (winner) {
        let resultEmbed: EmbedBuilder;
        if (winner === 'tie') {
          resultEmbed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} It's a Tie!`)
            .setColor(COLORS.info)
            .setDescription(displayBoard())
            .setTimestamp();
        } else {
          const winnerUser = await interaction.client.users.fetch(players[winner]);
          resultEmbed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} ${winnerUser.tag} Wins!`)
            .setColor(COLORS.success)
            .setDescription(displayBoard())
            .setTimestamp();
        }

        await i.update({ embeds: [resultEmbed], components: [] });
        collector.stop();
      } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        const updateEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} Tic-Tac-Toe`)
          .setColor(COLORS.info)
          .setDescription(`${interaction.user} (X) vs ${opponent} (O)\n\n${displayBoard()}\n\nCurrent turn: ${currentPlayer === 'X' ? interaction.user : opponent}`)
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

    const board = Array(9).fill(null);
    let currentPlayer = 'X';
    const players = { X: message.author.id, O: opponent.id };

    const displayBoard = () => {
      const emojis = { X: '❌', O: '⭕', null: '⬜' };
      const rows = [];
      for (let i = 0; i < 3; i++) {
        rows.push(board.slice(i * 3, (i + 1) * 3).map((cell) => emojis[cell]).join(' '));
      }
      return rows.join('\n');
    };

    const checkWinner = () => {
      const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6],
      ];
      for (const [a, b, c] of lines) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
          return board[a];
        }
      }
      return board.includes(null) ? null : 'tie';
    };

    const createButtons = () => {
      const row = new ActionRowBuilder<ButtonBuilder>();
      for (let i = 0; i < 9; i++) {
        const label = board[i] || (i + 1).toString();
        const style = board[i] ? ButtonStyle.Secondary : ButtonStyle.Primary;
        row.addComponents(
          new ButtonBuilder()
            .setCustomId(`ttt_${i}`)
            .setLabel(label)
            .setStyle(style)
            .setDisabled(board[i] !== null)
        );
      }
      return row;
    };

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Tic-Tac-Toe`)
      .setColor(COLORS.info)
      .setDescription(`${message.author} (X) vs ${opponent} (O)\n\n${displayBoard()}\n\nCurrent turn: ${currentPlayer === 'X' ? message.author : opponent}`)
      .setTimestamp();

    await message.reply({ embeds: [embed], components: [createButtons()] });

    const collector = message.channel.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 300000,
    });

    collector.on('collect', async (i) => {
      if (i.user.id !== players[currentPlayer]) {
        await i.reply({ content: "It's not your turn!", ephemeral: true });
        return;
      }

      const index = parseInt(i.customId.split('_')[1]);
      board[index] = currentPlayer;

      const winner = checkWinner();

      if (winner) {
        let resultEmbed: EmbedBuilder;
        if (winner === 'tie') {
          resultEmbed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} It's a Tie!`)
            .setColor(COLORS.info)
            .setDescription(displayBoard())
            .setTimestamp();
        } else {
          const winnerUser = await message.client.users.fetch(players[winner]);
          resultEmbed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} ${winnerUser.tag} Wins!`)
            .setColor(COLORS.success)
            .setDescription(displayBoard())
            .setTimestamp();
        }

        await i.update({ embeds: [resultEmbed], components: [] });
        collector.stop();
      } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        const updateEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} Tic-Tac-Toe`)
          .setColor(COLORS.info)
          .setDescription(`${message.author} (X) vs ${opponent} (O)\n\n${displayBoard()}\n\nCurrent turn: ${currentPlayer === 'X' ? message.author : opponent}`)
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

export default TicTacToeCommand;
