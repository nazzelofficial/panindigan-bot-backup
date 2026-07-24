import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class ScrambleCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'scramble',
      description: 'Unscramble a word',
      category: 'games',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['unscramble', 'wordscramble'],
      examples: ['/scramble', 'p!scramble'],
    };
    super(options);
  }

  private words = ['discord', 'programming', 'javascript', 'typescript', 'developer', 'computer', 'keyboard', 'monitor', 'internet', 'software', 'hardware', 'algorithm', 'database', 'function', 'variable', 'constant'];

  private scrambleWord(word: string): string {
    return word.split('').sort(() => Math.random() - 0.5).join('');
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const word = this.words[Math.floor(Math.random() * this.words.length)];
    const scrambled = this.scrambleWord(word);
    let attempts = 0;
    const maxAttempts = 3;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Word Scramble`)
      .setColor(COLORS.info)
      .setDescription(`Unscramble this word: \`${scrambled}\`\nYou have ${maxAttempts} attempts.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    const collector = interaction.channel?.createMessageCollector({
      filter: (m) => m.author.id === interaction.user.id,
      time: 60000,
    });

    collector?.on('collect', async (m) => {
      attempts++;

      if (m.content.toLowerCase() === word.toLowerCase()) {
        const winEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} You Won!`)
          .setColor(COLORS.success)
          .setDescription(`The word was "${word}". You got it in ${attempts} attempts!`)
          .setTimestamp();

        await interaction.editReply({ embeds: [winEmbed] });
        collector.stop();
      } else if (attempts >= maxAttempts) {
        const loseEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Game Over`)
          .setColor(COLORS.error)
          .setDescription(`The word was "${word}".`)
          .setTimestamp();

        await interaction.editReply({ embeds: [loseEmbed] });
        collector.stop();
      } else {
        const updateEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} Word Scramble`)
          .setColor(COLORS.info)
          .setDescription(`Unscramble this word: \`${scrambled}\`\nAttempts left: ${maxAttempts - attempts}`)
          .setTimestamp();

        await interaction.editReply({ embeds: [updateEmbed] });
      }
    });

    collector?.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Time's Up!`)
          .setColor(COLORS.error)
          .setDescription(`The word was "${word}".`)
          .setTimestamp();

        await interaction.editReply({ embeds: [timeoutEmbed] });
      }
    });
  }

  public async executePrefix(message: Message): Promise<void> {
    const word = this.words[Math.floor(Math.random() * this.words.length)];
    const scrambled = this.scrambleWord(word);
    let attempts = 0;
    const maxAttempts = 3;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Word Scramble`)
      .setColor(COLORS.info)
      .setDescription(`Unscramble this word: \`${scrambled}\`\nYou have ${maxAttempts} attempts.`)
      .setTimestamp();

    await message.reply({ embeds: [embed] });

    const collector = message.channel.createMessageCollector({
      filter: (m) => m.author.id === message.author.id,
      time: 60000,
    });

    collector.on('collect', async (m) => {
      attempts++;

      if (m.content.toLowerCase() === word.toLowerCase()) {
        const winEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} You Won!`)
          .setColor(COLORS.success)
          .setDescription(`The word was "${word}". You got it in ${attempts} attempts!`)
          .setTimestamp();

        await message.edit({ embeds: [winEmbed] });
        collector.stop();
      } else if (attempts >= maxAttempts) {
        const loseEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Game Over`)
          .setColor(COLORS.error)
          .setDescription(`The word was "${word}".`)
          .setTimestamp();

        await message.edit({ embeds: [loseEmbed] });
        collector.stop();
      } else {
        const updateEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} Word Scramble`)
          .setColor(COLORS.info)
          .setDescription(`Unscramble this word: \`${scrambled}\`\nAttempts left: ${maxAttempts - attempts}`)
          .setTimestamp();

        await message.edit({ embeds: [updateEmbed] });
      }
    });

    collector.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Time's Up!`)
          .setColor(COLORS.error)
          .setDescription(`The word was "${word}".`)
          .setTimestamp();

        await message.edit({ embeds: [timeoutEmbed] });
      }
    });
  }
}

export default ScrambleCommand;
