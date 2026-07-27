// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class WordChainCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'wordchain',
      description: 'Play word chain with another user',
      category: 'games',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['chain', 'wordgame'],
      examples: ['/wordchain @user', 'p!wordchain @user'],
    };
    super(options);
  }

  private usedWords = new Set<string>();
  private lastWord = '';

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const opponent = interaction.options.getUser('user');

    if (!opponent || opponent.id === interaction.user.id) {
      await interaction.reply({ content: '❌ Please mention another user to play against.', ephemeral: true });
      return;
    }

    this.usedWords.clear();
    this.lastWord = '';

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Word Chain`)
      .setColor(COLORS.info)
      .setDescription(`${interaction.user} vs ${opponent}\n\nTake turns saying words. Each word must start with the last letter of the previous word.\n\n${interaction.user}, start with any word!`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    const collector = interaction.channel?.createMessageCollector({
      filter: (m) => m.author.id === interaction.user.id || m.author.id === opponent.id,
      time: 300000,
    });

    let currentPlayer = interaction.user.id;
    let gameOver = false;

    collector?.on('collect', async (m) => {
      if (gameOver) return;

      if (m.author.id !== currentPlayer) {
        await m.reply("It's not your turn!");
        return;
      }

      const word = m.content.toLowerCase().trim();

      if (!/^[a-z]+$/.test(word)) {
        await m.reply('Please use only letters!');
        return;
      }

      if (this.usedWords.has(word)) {
        await m.reply('This word was already used!');
        return;
      }

      if (this.lastWord && !word.startsWith(this.lastWord.slice(-1))) {
        await m.reply(`Word must start with "${this.lastWord.slice(-1)}"!`);
        return;
      }

      this.usedWords.add(word);
      this.lastWord = word;
      currentPlayer = currentPlayer === interaction.user.id ? opponent.id : interaction.user.id;

      const updateEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.games} Word Chain`)
        .setColor(COLORS.info)
        .setDescription(`${interaction.user} vs ${opponent}\n\nLast word: **${word}**\n\n${currentPlayer === interaction.user.id ? interaction.user : opponent}, your turn!`)
        .setTimestamp();

      await interaction.editReply({ embeds: [updateEmbed] });
    });

    collector?.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Game Ended`)
          .setColor(COLORS.error)
          .setDescription('Game timed out.')
          .setTimestamp();

        await interaction.editReply({ embeds: [timeoutEmbed] });
      }
    });
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const opponent = message.mentions.users.first();

    if (!opponent || opponent.id === message.author.id) {
      await message.reply('❌ Please mention another user to play against.');
      return;
    }

    this.usedWords.clear();
    this.lastWord = '';

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Word Chain`)
      .setColor(COLORS.info)
      .setDescription(`${message.author} vs ${opponent}\n\nTake turns saying words. Each word must start with the last letter of the previous word.\n\n${message.author}, start with any word!`)
      .setTimestamp();

    await message.reply({ embeds: [embed] });

    const collector = message.channel.createMessageCollector({
      filter: (m) => m.author.id === message.author.id || m.author.id === opponent.id,
      time: 300000,
    });

    let currentPlayer = message.author.id;
    let gameOver = false;

    collector.on('collect', async (m) => {
      if (gameOver) return;

      if (m.author.id !== currentPlayer) {
        await m.reply("It's not your turn!");
        return;
      }

      const word = m.content.toLowerCase().trim();

      if (!/^[a-z]+$/.test(word)) {
        await m.reply('Please use only letters!');
        return;
      }

      if (this.usedWords.has(word)) {
        await m.reply('This word was already used!');
        return;
      }

      if (this.lastWord && !word.startsWith(this.lastWord.slice(-1))) {
        await m.reply(`Word must start with "${this.lastWord.slice(-1)}"!`);
        return;
      }

      this.usedWords.add(word);
      this.lastWord = word;
      currentPlayer = currentPlayer === message.author.id ? opponent.id : message.author.id;

      const updateEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.games} Word Chain`)
        .setColor(COLORS.info)
        .setDescription(`${message.author} vs ${opponent}\n\nLast word: **${word}**\n\n${currentPlayer === message.author.id ? message.author : opponent}, your turn!`)
        .setTimestamp();

      await message.edit({ embeds: [updateEmbed] });
    });

    collector.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Game Ended`)
          .setColor(COLORS.error)
          .setDescription('Game timed out.')
          .setTimestamp();

        await message.edit({ embeds: [timeoutEmbed] });
      }
    });
  }
}

export default WordChainCommand;
