import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class TypingTestCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'typingtest',
      description: 'Test your typing speed',
      category: 'games',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['typing', 'speedtest'],
      examples: ['/typingtest', 'p!typingtest'],
    };
    super(options);
  }

  private sentences = [
    'The quick brown fox jumps over the lazy dog.',
    'Pack my box with five dozen liquor jugs.',
    'How vexingly quick daft zebras jump!',
    'Sphinx of black quartz, judge my vow.',
    'Two driven jocks help fax my big quiz.',
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const sentence = this.sentences[Math.floor(Math.random() * this.sentences.length)];
    const startTime = Date.now();

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Typing Test`)
      .setColor(COLORS.info)
      .setDescription(`Type this sentence as fast as you can:\n\n\`${sentence}\``)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    const collector = interaction.channel?.createMessageCollector({
      filter: (m) => m.author.id === interaction.user.id,
      time: 60000,
    });

    collector?.on('collect', async (m) => {
      const endTime = Date.now();
      const timeTaken = (endTime - startTime) / 1000;
      const words = sentence.split(' ');
      const userWords = m.content.split(' ');
      let correctWords = 0;

      for (let i = 0; i < Math.min(words.length, userWords.length); i++) {
        if (words[i].toLowerCase() === userWords[i].toLowerCase()) {
          correctWords++;
        }
      }

      const wpm = Math.round((correctWords / timeTaken) * 60);
      const accuracy = Math.round((correctWords / words.length) * 100);

      const resultEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.games} Typing Test Results`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'WPM', value: wpm.toString(), inline: true },
          { name: 'Accuracy', value: `${accuracy}%`, inline: true },
          { name: 'Time', value: `${timeTaken.toFixed(2)}s`, inline: true },
          { name: 'Correct Words', value: `${correctWords}/${words.length}`, inline: true },
        ])
        .setTimestamp();

      await interaction.editReply({ embeds: [resultEmbed] });
      collector.stop();
    });

    collector?.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Time's Up!`)
          .setColor(COLORS.error)
          .setDescription('You didn\'t type anything in time.')
          .setTimestamp();

        await interaction.editReply({ embeds: [timeoutEmbed] });
      }
    });
  }

  public async executePrefix(message: Message): Promise<void> {
    const sentence = this.sentences[Math.floor(Math.random() * this.sentences.length)];
    const startTime = Date.now();

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Typing Test`)
      .setColor(COLORS.info)
      .setDescription(`Type this sentence as fast as you can:\n\n\`${sentence}\``)
      .setTimestamp();

    await message.reply({ embeds: [embed] });

    const collector = message.channel.createMessageCollector({
      filter: (m) => m.author.id === message.author.id,
      time: 60000,
    });

    collector.on('collect', async (m) => {
      const endTime = Date.now();
      const timeTaken = (endTime - startTime) / 1000;
      const words = sentence.split(' ');
      const userWords = m.content.split(' ');
      let correctWords = 0;

      for (let i = 0; i < Math.min(words.length, userWords.length); i++) {
        if (words[i].toLowerCase() === userWords[i].toLowerCase()) {
          correctWords++;
        }
      }

      const wpm = Math.round((correctWords / timeTaken) * 60);
      const accuracy = Math.round((correctWords / words.length) * 100);

      const resultEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.games} Typing Test Results`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'WPM', value: wpm.toString(), inline: true },
          { name: 'Accuracy', value: `${accuracy}%`, inline: true },
          { name: 'Time', value: `${timeTaken.toFixed(2)}s`, inline: true },
          { name: 'Correct Words', value: `${correctWords}/${words.length}`, inline: true },
        ])
        .setTimestamp();

      await message.edit({ embeds: [resultEmbed] });
      collector.stop();
    });

    collector.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Time's Up!`)
          .setColor(COLORS.error)
          .setDescription('You didn\'t type anything in time.')
          .setTimestamp();

        await message.edit({ embeds: [timeoutEmbed] });
      }
    });
  }
}

export default TypingTestCommand;
