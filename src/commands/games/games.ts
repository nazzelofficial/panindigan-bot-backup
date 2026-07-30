// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import {
  ChatInputCommandInteraction, Message, SlashCommandBuilder,
  ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType,
} from 'discord.js';
import { ErrorHandler } from '../../handlers/ErrorHandler.js';
import { SuccessHandler } from '../../handlers/SuccessHandler.js';
import { EmbedManager } from '../../structures/EmbedManager.js';
import { validationService } from '../../services/ValidationService.js';
import { emojiManager } from '../../utils/EmojiManager.js';

export class GamesCommand extends BaseCommand {
  constructor() {
    super({
      name: 'games',
      description: 'Interactive games to play with others',
      category: 'games',
      premiumTier: 'free',
      cooldown: 5,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['game', 'play'],
      examples: ['/games tictactoe @user', '/games trivia', '/games rps'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder()
      .setName(this.name).setDescription(this.description)
      
      // 2-Player Games Subcommand Group
      .addSubcommandGroup(g => g.setName('2player').setDescription('Games for 2 players')
        .addSubcommand(s => s.setName('tictactoe').setDescription('Play Tic Tac Toe')
          .addUserOption(o => o.setName('opponent').setDescription('Your opponent').setRequired(true)))
        .addSubcommand(s => s.setName('connect4').setDescription('Play Connect 4')
          .addUserOption(o => o.setName('opponent').setDescription('Your opponent').setRequired(true)))
        .addSubcommand(s => s.setName('battleship').setDescription('Play Battleship')
          .addUserOption(o => o.setName('opponent').setDescription('Your opponent').setRequired(true)))
        .addSubcommand(s => s.setName('chess').setDescription('Play Chess')
          .addUserOption(o => o.setName('opponent').setDescription('Your opponent').setRequired(true)))
        .addSubcommand(s => s.setName('rps').setDescription('Play Rock Paper Scissors')
          .addUserOption(o => o.setName('opponent').setDescription('Your opponent').setRequired(true)))
        .addSubcommand(s => s.setName('rpsls').setDescription('Play Rock Paper Scissors Lizard Spock')
          .addUserOption(o => o.setName('opponent').setDescription('Your opponent').setRequired(true))))
      
      // Single Player Games Subcommand Group
      .addSubcommandGroup(g => g.setName('single').setDescription('Single player games')
        .addSubcommand(s => s.setName('2048').setDescription('Play 2048'))
        .addSubcommand(s => s.setName('snake').setDescription('Play Snake'))
        .addSubcommand(s => s.setName('minesweeper').setDescription('Play Minesweeper')
          .addIntegerOption(o => o.setName('difficulty').setDescription('Difficulty (1-3)').setRequired(false).setMinValue(1).setMaxValue(3)))
        .addSubcommand(s => s.setName('sudoku').setDescription('Play Sudoku')
          .addIntegerOption(o => o.setName('difficulty').setDescription('Difficulty (1-3)').setRequired(false).setMinValue(1).setMaxValue(3)))
        .addSubcommand(s => s.setName('wordle').setDescription('Play Wordle'))
        .addSubcommand(s => s.setName('wordsearch').setDescription('Play Word Search'))
        .addSubcommand(s => s.setName('memory').setDescription('Play Memory Match'))
        .addSubcommand(s => s.setName('simonsays').setDescription('Play Simon Says'))
        .addSubcommand(s => s.setName('reaction').setDescription('Test your reaction time'))
        .addSubcommand(s => s.setName('typing').setDescription('Test your typing speed'))
        .addSubcommand(s => s.setName('whackamole').setDescription('Play Whack-a-Mole'))
      
      // Casino Games Subcommand Group
      .addSubcommandGroup(g => g.setName('casino').setDescription('Casino-style games')
        .addSubcommand(s => s.setName('blackjack').setDescription('Play Blackjack')
          .addIntegerOption(o => o.setName('bet').setDescription('Bet amount').setRequired(true).setMinValue(1)))
        .addSubcommand(s => s.setName('roulette').setDescription('Play Roulette')
          .addIntegerOption(o => o.setName('bet').setDescription('Bet amount').setRequired(true).setMinValue(1))
          .addStringOption(o => o.setName('choice').setDescription('Bet choice').setRequired(true)
            .addChoices({ name: 'Red', value: 'red' }, { name: 'Black', value: 'black' }, { name: 'Green', value: 'green' }))
        .addSubcommand(s => s.setName('slots').setDescription('Play Slots')
          .addIntegerOption(o => o.setName('bet').setDescription('Bet amount').setRequired(true).setMinValue(1))
        .addSubcommand(s => s.setName('poker').setDescription('Play Video Poker')
          .addIntegerOption(o => o.setName('bet').setDescription('Bet amount').setRequired(true).setMinValue(1))
        .addSubcommand(s => s.setName('higherlower').setDescription('Play Higher or Lower')
          .addIntegerOption(o => o.setName('bet').setDescription('Bet amount').setRequired(true).setMinValue(1))
      
      // Trivia & Quiz Subcommand Group
      .addSubcommandGroup(g => g.setName('trivia').setDescription('Trivia and quiz games')
        .addSubcommand(s => s.setName('trivia').setDescription('Play trivia')
          .addStringOption(o => o.setName('category').setDescription('Category').setRequired(false)
            .addChoices({ name: 'General', value: 'general' }, { name: 'Science', value: 'science' }, { name: 'History', value: 'history' }, { name: 'Geography', value: 'geography' }))
        .addSubcommand(s => s.setName('akinator').setDescription('Play Akinator - guess the character'))
        .addSubcommand(s => s.setName('hangman').setDescription('Play Hangman')
          .addStringOption(o => o.setName('category').setDescription('Category').setRequired(false)
            .addChoices({ name: 'Animals', value: 'animals' }, { name: 'Countries', value: 'countries' }, { name: 'Food', value: 'food' }))
      
      // RPG Subcommand Group
      .addSubcommandGroup(g => g.setName('rpg').setDescription('Role-playing games')
        .addSubcommand(s => s.setName('adventure').setDescription('Start an adventure'))
        .addSubcommand(s => s.setName('character').setDescription('View your character')
          .addUserOption(o => o.setName('user').setDescription('User to view character for').setRequired(false))
        .addSubcommand(s => s.setName('inventory').setDescription('View your inventory')
          .addUserOption(o => o.setName('user').setDescription('User to view inventory for').setRequired(false))
        .addSubcommand(s => s.setName('battle').setDescription('Battle another player')
          .addUserOption(o => o.setName('opponent').setDescription('Your opponent').setRequired(false));
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const subcommandGroup = i.options.getSubcommandGroup();
    const subcommand = i.options.getSubcommand();

    const validation = await validationService.validateInteraction(i, {
      checkBlacklist: true,
    });

    if (!validation.valid) {
      await ErrorHandler.generic(i, new Error(validation.error));
      return;
    }

    if (subcommandGroup === '2player') {
      switch (subcommand) {
        case 'tictactoe': await this.handleTicTacToe(i); break;
        case 'connect4': await this.handleConnect4(i); break;
        case 'battleship': await this.handleBattleship(i); break;
        case 'chess': await this.handleChess(i); break;
        case 'rps': await this.handleRPS(i); break;
        case 'rpsls': await this.handleRPSLS(i); break;
      }
    } else if (subcommandGroup === 'single') {
      switch (subcommand) {
        case '2048': await this.handle2048(i); break;
        case 'snake': await this.handleSnake(i); break;
        case 'minesweeper': await this.handleMinesweeper(i); break;
        case 'sudoku': await this.handleSudoku(i); break;
        case 'wordle': await this.handleWordle(i); break;
        case 'wordsearch': await this.handleWordSearch(i); break;
        case 'memory': await this.handleMemory(i); break;
        case 'simonsays': await this.handleSimonSays(i); break;
        case 'reaction': await this.handleReaction(i); break;
        case 'typing': await this.handleTyping(i); break;
        case 'whackamole': await this.handleWhackAMole(i); break;
      }
    } else if (subcommandGroup === 'casino') {
      switch (subcommand) {
        case 'blackjack': await this.handleBlackjack(i); break;
        case 'roulette': await this.handleRoulette(i); break;
        case 'slots': await this.handleSlots(i); break;
        case 'poker': await this.handlePoker(i); break;
        case 'higherlower': await this.handleHigherLower(i); break;
      }
    } else if (subcommandGroup === 'trivia') {
      switch (subcommand) {
        case 'trivia': await this.handleTrivia(i); break;
        case 'akinator': await this.handleAkinator(i); break;
        case 'hangman': await this.handleHangman(i); break;
      }
    } else if (subcommandGroup === 'rpg') {
      switch (subcommand) {
        case 'adventure': await this.handleAdventure(i); break;
        case 'character': await this.handleCharacter(i); break;
        case 'inventory': await this.handleInventory(i); break;
        case 'battle': await this.handleBattle(i); break;
      }
    }
  }

  // 2-Player Games
  private async handleTicTacToe(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const opponent = i.options.getUser('opponent', true);

    try {
      const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder().setCustomId('ttt_0').setLabel(' ').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId('ttt_1').setLabel(' ').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId('ttt_2').setLabel(' ').setStyle(ButtonStyle.Secondary),
        )
        .addComponents(
          new ButtonBuilder().setCustomId('ttt_3').setLabel(' ').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId('ttt_4').setLabel(' ').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId('ttt_5').setLabel(' ').setStyle(ButtonStyle.Secondary),
        )
        .addComponents(
          new ButtonBuilder().setCustomId('ttt_6').setLabel(' ').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId('ttt_7').setLabel(' ').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId('ttt_8').setLabel(' ').setStyle(ButtonStyle.Secondary),
        );

      const embed = EmbedManager.games('Tic Tac Toe', `${i.user.tag} vs ${opponent.tag}\n\nClick a button to place your mark!`, { timestamp: true });
      await i.editReply({ embeds: [embed], components: [row] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleConnect4(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const opponent = i.options.getUser('opponent', true);

    try {
      const embed = EmbedManager.games('Connect 4', `${i.user.tag} vs ${opponent.tag}\n\nGame starting...`, { timestamp: true });
      await i.editReply({ embed });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleBattleship(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const opponent = i.options.getUser('opponent', true);

    try {
      const embed = EmbedManager.games('Battleship', `${i.user.tag} vs ${opponent.tag}\n\nPlace your ships!`, { timestamp: true });
      await i.editReply({ embed });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleChess(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const opponent = i.options.getUser('opponent', true);

    try {
      const embed = EmbedManager.games('Chess', `${i.user.tag} vs ${opponent.tag}\n\nWhite moves first!`, { timestamp: true });
      await i.editReply({ embed });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleRPS(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const opponent = i.options.getUser('opponent', true);

    try {
      const choices = ['rock', 'paper', 'scissors'];
      const player1Choice = choices[Math.floor(Math.random() * choices.length)];
      const player2Choice = choices[Math.floor(Math.random() * choices.length)];

      let result = '';
      if (player1Choice === player2Choice) {
        result = 'It\'s a tie!';
      } else if (
        (player1Choice === 'rock' && player2Choice === 'scissors') ||
        (player1Choice === 'paper' && player2Choice === 'rock') ||
        (player1Choice === 'scissors' && player2Choice === 'paper')
      ) {
        result = `${i.user.tag} wins!`;
      } else {
        result = `${opponent.tag} wins!`;
      }

      const embed = EmbedManager.games('Rock Paper Scissors', `${i.user.tag}: ${player1Choice}\n${opponent.tag}: ${player2Choice}\n\n${result}`, { timestamp: true });
      await i.editReply({ embed });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleRPSLS(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const opponent = i.options.getUser('opponent', true);

    try {
      const choices = ['rock', 'paper', 'scissors', 'lizard', 'spock'];
      const player1Choice = choices[Math.floor(Math.random() * choices.length)];
      const player2Choice = choices[Math.floor(Math.random() * choices.length)];

      const embed = EmbedManager.games('RPSLS', `${i.user.tag}: ${player1Choice}\n${opponent.tag}: ${player2Choice}`, { timestamp: true });
      await i.editReply({ embed });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  // Single Player Games
  private async handle2048(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();

    try {
      const embed = EmbedManager.games('2048', 'Use arrow buttons to merge tiles and reach 2048!', { timestamp: true });
      await i.editReply({ embed });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleSnake(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();

    try {
      const embed = EmbedManager.games('Snake', 'Use arrow buttons to control the snake and eat food!', { timestamp: true });
      await i.editReply({ embed });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleMinesweeper(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const difficulty = i.options.getInteger('difficulty') || 1;

    try {
      const embed = EmbedManager.games('Minesweeper', `Difficulty: ${difficulty}\n\nClick cells to reveal them!`, { timestamp: true });
      await i.editReply({ embed });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleSudoku(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const difficulty = i.options.getInteger('difficulty') || 1;

    try {
      const embed = EmbedManager.games('Sudoku', `Difficulty: ${difficulty}\n\nFill in the grid!`, { timestamp: true });
      await i.editReply({ embed });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleWordle(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();

    try {
      const embed = EmbedManager.games('Wordle', 'Guess the 5-letter word in 6 tries!', { timestamp: true });
      await i.editReply({ embed });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleWordSearch(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();

    try {
      const embed = EmbedManager.games('Word Search', 'Find all the hidden words!', { timestamp: true });
      await i.editReply({ embed });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleMemory(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();

    try {
      const embed = EmbedManager.games('Memory Match', 'Match all the pairs!', { timestamp: true });
      await i.editReply({ embed });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleSimonSays(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();

    try {
      const embed = EmbedManager.games('Simon Says', 'Watch the pattern and repeat it!', { timestamp: true });
      await i.editReply({ embed });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleReaction(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();

    try {
      const embed = EmbedManager.games('Reaction Time', 'Click the button as fast as you can when it appears!', { timestamp: true });
      await i.editReply({ embed });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleTyping(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();

    try {
      const embed = EmbedManager.games('Typing Race', 'Type the text as fast as you can!', { timestamp: true });
      await i.editReply({ embed });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleWhackAMole(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();

    try {
      const embed = EmbedManager.games('Whack-a-Mole', 'Click the moles before they disappear!', { timestamp: true });
      await i.editReply({ embed });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  // Casino Games
  private async handleBlackjack(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const bet = i.options.getInteger('bet', true);

    try {
      const embed = EmbedManager.games('Blackjack', `Bet: ${bet}\n\nYour hand: ?\nDealer: ?`, { timestamp: true });
      await i.editReply({ embed });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleRoulette(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const bet = i.options.getInteger('bet', true);
    const choice = i.options.getString('choice', true);

    try {
      const result = Math.floor(Math.random() * 37);
      const isRed = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(result);
      const isBlack = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35].includes(result);
      const isGreen = result === 0;

      let won = false;
      if (choice === 'red' && isRed) won = true;
      else if (choice === 'black' && isBlack) won = true;
      else if (choice === 'green' && isGreen) won = true;

      const embed = EmbedManager.games('Roulette', `Result: ${result} (${isGreen ? 'Green' : isRed ? 'Red' : 'Black'})\nYou ${won ? 'won' : 'lost'}!`, { timestamp: true });
      await i.editReply({ embed });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleSlots(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const bet = i.options.getInteger('bet', true);

    try {
      const symbols = ['🍒', '🍋', '🍊', '🍇', '💎', '7️⃣'];
      const result = [symbols[Math.floor(Math.random() * symbols.length)], symbols[Math.floor(Math.random() * symbols.length)], symbols[Math.floor(Math.random() * symbols.length)]];
      
      let multiplier = 0;
      if (result[0] === result[1] && result[1] === result[2]) {
        multiplier = result[0] === '7️⃣' ? 10 : result[0] === '💎' ? 5 : 3;
      } else if (result[0] === result[1] || result[1] === result[2] || result[0] === result[2]) {
        multiplier = 1.5;
      }

      const embed = EmbedManager.games('Slots', `${result.join(' ')}\nMultiplier: ${multiplier}x`, { timestamp: true });
      await i.editReply({ embed });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handlePoker(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const bet = i.options.getInteger('bet', true);

    try {
      const embed = EmbedManager.games('Video Poker', `Bet: ${bet}\n\nYour hand: 🎴🎴🎴🎴🎴`, { timestamp: true });
      await i.editReply({ embed });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleHigherLower(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const bet = i.options.getInteger('bet', true);

    try {
      const currentNumber = Math.floor(Math.random() * 100);
      const nextNumber = Math.floor(Math.random() * 100);

      const embed = EmbedManager.games('Higher or Lower', `Current: ${currentNumber}\nNext: ${nextNumber}\n\nWas it higher or lower?`, { timestamp: true });
      await i.editReply({ embed });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  // Trivia Games
  private async handleTrivia(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const category = i.options.getString('category') || 'general';

    try {
      const embed = EmbedManager.games('Trivia', `Category: ${category}\n\nQuestion: What is the capital of France?`, { timestamp: true });
      await i.editReply({ embed });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleAkinator(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();

    try {
      const embed = EmbedManager.games('Akinator', 'Think of a character and I will try to guess it!\n\nQuestion 1: Is your character real?', { timestamp: true });
      await i.editReply({ embed });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleHangman(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const category = i.options.getString('category') || 'animals';

    try {
      const word = 'ELEPHANT';
      const masked = '_ _ _ _ _ _ _ _';
      
      const embed = EmbedManager.games('Hangman', `Category: ${category}\n\nWord: ${masked}\n\nGuess a letter!`, { timestamp: true });
      await i.editReply({ embed });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  // RPG Games
  private async handleAdventure(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();

    try {
      const embed = EmbedManager.games('Adventure', 'You find yourself at the entrance of a dark dungeon...\n\nWhat do you do?', { timestamp: true });
      await i.editReply({ embed });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleCharacter(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const user = i.options.getUser('user') || i.user;

    try {
      const embed = EmbedManager.games('Character', `${user.tag}'s Character`, {
        fields: [
          { name: '⚔️ Level', value: '1', inline: true },
          { name: '❤️ HP', value: '100/100', inline: true },
          { name: '⚡ XP', value: '0/100', inline: true },
          { name: '💰 Gold', value: '50', inline: true },
        ],
        timestamp: true,
      });
      await i.editReply({ embed });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleInventory(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const user = i.options.getUser('user') || i.user;

    try {
      const embed = EmbedManager.games('Inventory', `${user.tag}'s Inventory`, {
        fields: [
          { name: '🗡️ Sword', value: 'Common', inline: true },
          { name: '🛡️ Shield', value: 'Common', inline: true },
          { name: '🧪 Potion', value: 'x5', inline: true },
        ],
        timestamp: true,
      });
      await i.editReply({ embed });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleBattle(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const opponent = i.options.getUser('opponent');

    try {
      if (opponent) {
        const embed = EmbedManager.games('Battle', `${i.user.tag} vs ${opponent.tag}\n\nBattle starting!`, { timestamp: true });
        await i.editReply({ embed });
      } else {
        const embed = EmbedManager.games('Battle', `${i.user.tag} vs Wild Monster\n\nBattle starting!`, { timestamp: true });
        await i.editReply({ embed });
      }
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    await m.reply({ content: 'Use slash command /games for full options.' });
  }
}

export default GamesCommand;
