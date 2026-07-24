import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class GuessEmojiCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'guessemoji',
      description: 'Guess the emoji from description',
      category: 'games',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['emojiquiz'],
      examples: ['/guessemoji', 'p!guessemoji'],
    };
    super(options);
  }

  private emojis = [
    { emoji: '😀', description: 'A smiling face' },
    { emoji: '❤️', description: 'A red heart' },
    { emoji: '🌟', description: 'A glowing star' },
    { emoji: '🔥', description: 'A fire' },
    { emoji: '🎮', description: 'A video game controller' },
    { emoji: '🎵', description: 'A musical note' },
    { emoji: '🌈', description: 'A rainbow' },
    { emoji: '🍕', description: 'A pizza slice' },
    { emoji: '🚀', description: 'A rocket ship' },
    { emoji: '🐱', description: 'A cat face' },
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const emoji = this.emojis[Math.floor(Math.random() * this.emojis.length)];
    let attempts = 0;
    const maxAttempts = 3;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Guess the Emoji`)
      .setColor(COLORS.info)
      .setDescription(`Guess the emoji from this description:\n\n"${emoji.description}"\n\nYou have ${maxAttempts} attempts.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    const collector = interaction.channel?.createMessageCollector({
      filter: (m) => m.author.id === interaction.user.id,
      time: 60000,
    });

    collector?.on('collect', async (m) => {
      attempts++;

      if (m.content === emoji.emoji) {
        const winEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} You Won!`)
          .setColor(COLORS.success)
          .setDescription(`The emoji was ${emoji.emoji}. You got it in ${attempts} attempts!`)
          .setTimestamp();

        await interaction.editReply({ embeds: [winEmbed] });
        collector.stop();
      } else if (attempts >= maxAttempts) {
        const loseEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Game Over`)
          .setColor(COLORS.error)
          .setDescription(`The emoji was ${emoji.emoji}.`)
          .setTimestamp();

        await interaction.editReply({ embeds: [loseEmbed] });
        collector.stop();
      } else {
        const updateEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} Guess the Emoji`)
          .setColor(COLORS.info)
          .setDescription(`Wrong! Attempts left: ${maxAttempts - attempts}\n\n"${emoji.description}"`)
          .setTimestamp();

        await interaction.editReply({ embeds: [updateEmbed] });
      }
    });

    collector?.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Time's Up!`)
          .setColor(COLORS.error)
          .setDescription(`The emoji was ${emoji.emoji}.`)
          .setTimestamp();

        await interaction.editReply({ embeds: [timeoutEmbed] });
      }
    });
  }

  public async executePrefix(message: Message): Promise<void> {
    const emoji = this.emojis[Math.floor(Math.random() * this.emojis.length)];
    let attempts = 0;
    const maxAttempts = 3;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Guess the Emoji`)
      .setColor(COLORS.info)
      .setDescription(`Guess the emoji from this description:\n\n"${emoji.description}"\n\nYou have ${maxAttempts} attempts.`)
      .setTimestamp();

    await message.reply({ embeds: [embed] });

    const collector = message.channel.createMessageCollector({
      filter: (m) => m.author.id === message.author.id,
      time: 60000,
    });

    collector.on('collect', async (m) => {
      attempts++;

      if (m.content === emoji.emoji) {
        const winEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} You Won!`)
          .setColor(COLORS.success)
          .setDescription(`The emoji was ${emoji.emoji}. You got it in ${attempts} attempts!`)
          .setTimestamp();

        await message.edit({ embeds: [winEmbed] });
        collector.stop();
      } else if (attempts >= maxAttempts) {
        const loseEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Game Over`)
          .setColor(COLORS.error)
          .setDescription(`The emoji was ${emoji.emoji}.`)
          .setTimestamp();

        await message.edit({ embeds: [loseEmbed] });
        collector.stop();
      } else {
        const updateEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} Guess the Emoji`)
          .setColor(COLORS.info)
          .setDescription(`Wrong! Attempts left: ${maxAttempts - attempts}\n\n"${emoji.description}"`)
          .setTimestamp();

        await message.edit({ embeds: [updateEmbed] });
      }
    });

    collector.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Time's Up!`)
          .setColor(COLORS.error)
          .setDescription(`The emoji was ${emoji.emoji}.`)
          .setTimestamp();

        await message.edit({ embeds: [timeoutEmbed] });
      }
    });
  }
}

export default GuessEmojiCommand;
