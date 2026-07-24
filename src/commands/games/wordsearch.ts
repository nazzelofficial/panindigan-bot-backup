import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class WordSearchCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'wordsearch',
      description: 'Find hidden words in a grid (simplified)',
      category: 'games',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['wordfind'],
      examples: ['/wordsearch', 'p!wordsearch'],
    };
    super(options);
  }

  private words = ['CAT', 'DOG', 'SUN', 'FUN', 'RUN'];
  private gridSize = 8;

  private generateGrid(): { grid: string[][]; words: { word: string; found: boolean }[] } {
    const grid: string[][] = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(''));
    const wordObjects = this.words.map((word) => ({ word, found: false }));

    for (const wordObj of wordObjects) {
      const word = wordObj.word;
      let placed = false;
      let attempts = 0;

      while (!placed && attempts < 100) {
        const direction = Math.floor(Math.random() * 2);
        const startRow = Math.floor(Math.random() * this.gridSize);
        const startCol = Math.floor(Math.random() * this.gridSize);

        if (direction === 0) {
          if (startCol + word.length <= this.gridSize) {
            let canPlace = true;
            for (let i = 0; i < word.length; i++) {
              if (grid[startRow][startCol + i] !== '' && grid[startRow][startCol + i] !== word[i]) {
                canPlace = false;
                break;
              }
            }
            if (canPlace) {
              for (let i = 0; i < word.length; i++) {
                grid[startRow][startCol + i] = word[i];
              }
              placed = true;
            }
          }
        } else {
          if (startRow + word.length <= this.gridSize) {
            let canPlace = true;
            for (let i = 0; i < word.length; i++) {
              if (grid[startRow + i][startCol] !== '' && grid[startRow + i][startCol] !== word[i]) {
                canPlace = false;
                break;
              }
            }
            if (canPlace) {
              for (let i = 0; i < word.length; i++) {
                grid[startRow + i][startCol] = word[i];
              }
              placed = true;
            }
          }
        }
        attempts++;
      }
    }

    for (let i = 0; i < this.gridSize; i++) {
      for (let j = 0; j < this.gridSize; j++) {
        if (grid[i][j] === '') {
          grid[i][j] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        }
      }
    }

    return { grid, words: wordObjects };
  }

  private displayGrid(grid: string[][]): string {
    return grid.map((row) => row.join(' ')).join('\n');
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const { grid, words } = this.generateGrid();
    let foundCount = 0;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Word Search`)
      .setColor(COLORS.info)
      .setDescription(`Find these words: ${words.map((w) => w.word).join(', ')}\n\n\`\`\`\n${this.displayGrid(grid)}\n\`\`\``)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    const collector = interaction.channel?.createMessageCollector({
      filter: (m) => m.author.id === interaction.user.id,
      time: 180000,
    });

    collector?.on('collect', async (m) => {
      const guess = m.content.toUpperCase();

      const wordObj = words.find((w) => w.word === guess && !w.found);
      if (wordObj) {
        wordObj.found = true;
        foundCount++;

        if (foundCount === words.length) {
          const winEmbed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} You Won!`)
            .setColor(COLORS.success)
            .setDescription('You found all the words!')
            .setTimestamp();

          await interaction.editReply({ embeds: [winEmbed] });
          collector.stop();
        } else {
          const updateEmbed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} Word Search`)
            .setColor(COLORS.info)
            .setDescription(`Found: ${words.filter((w) => w.found).map((w) => w.word).join(', ')}\nRemaining: ${words.filter((w) => !w.found).map((w) => w.word).join(', ')}\n\n\`\`\`\n${this.displayGrid(grid)}\n\`\`\``)
            .setTimestamp();

          await interaction.editReply({ embeds: [updateEmbed] });
        }
      } else {
        await m.reply('Word not found or already found. Try again!');
      }
    });

    collector?.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Time's Up!`)
          .setColor(COLORS.error)
          .setDescription(`You found ${foundCount}/${words.length} words.`)
          .setTimestamp();

        await interaction.editReply({ embeds: [timeoutEmbed] });
      }
    });
  }

  public async executePrefix(message: Message): Promise<void> {
    const { grid, words } = this.generateGrid();
    let foundCount = 0;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Word Search`)
      .setColor(COLORS.info)
      .setDescription(`Find these words: ${words.map((w) => w.word).join(', ')}\n\n\`\`\`\n${this.displayGrid(grid)}\n\`\`\``)
      .setTimestamp();

    await message.reply({ embeds: [embed] });

    const collector = message.channel.createMessageCollector({
      filter: (m) => m.author.id === message.author.id,
      time: 180000,
    });

    collector.on('collect', async (m) => {
      const guess = m.content.toUpperCase();

      const wordObj = words.find((w) => w.word === guess && !w.found);
      if (wordObj) {
        wordObj.found = true;
        foundCount++;

        if (foundCount === words.length) {
          const winEmbed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} You Won!`)
            .setColor(COLORS.success)
            .setDescription('You found all the words!')
            .setTimestamp();

          await message.edit({ embeds: [winEmbed] });
          collector.stop();
        } else {
          const updateEmbed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} Word Search`)
            .setColor(COLORS.info)
            .setDescription(`Found: ${words.filter((w) => w.found).map((w) => w.word).join(', ')}\nRemaining: ${words.filter((w) => !w.found).map((w) => w.word).join(', ')}\n\n\`\`\`\n${this.displayGrid(grid)}\n\`\`\``)
            .setTimestamp();

          await message.edit({ embeds: [updateEmbed] });
        }
      } else {
        await m.reply('Word not found or already found. Try again!');
      }
    });

    collector.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Time's Up!`)
          .setColor(COLORS.error)
          .setDescription(`You found ${foundCount}/${words.length} words.`)
          .setTimestamp();

        await message.edit({ embeds: [timeoutEmbed] });
      }
    });
  }
}

export default WordSearchCommand;
