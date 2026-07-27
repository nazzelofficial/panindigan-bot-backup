// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class GuessWhoAmICommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'guesswhoami',
      description: 'Guess the character from hints',
      category: 'games',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['whoami', 'guesscharacter'],
      examples: ['/guesswhoami', 'p!guesswhoami'],
    };
    super(options);
  }

  private characters = [
    { name: 'Mario', hints: ['I am a plumber', 'I wear red', 'I have a mustache', 'I save princesses'] },
    { name: 'Pikachu', hints: ['I am yellow', 'I am electric', 'I say "pika pika"', 'I am a Pokémon'] },
    { name: 'Sonic', hints: ['I am blue', 'I run fast', 'I collect rings', 'I fight Dr. Robotnik'] },
    { name: 'Link', hints: ['I wear green', 'I have a sword', 'I save Zelda', 'I am from Hyrule'] },
    { name: 'Master Chief', hints: ['I wear armor', 'I fight aliens', 'I am a Spartan', 'I work for the UNSC'] },
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const character = this.characters[Math.floor(Math.random() * this.characters.length)];
    const hintsToShow = character.hints.slice(0, 2);

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Guess Who Am I`)
      .setColor(COLORS.info)
      .setDescription(`Guess the character from these hints:\n\n${hintsToShow.map((h) => `• ${h}`).join('\n')}`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    const collector = interaction.channel?.createMessageCollector({
      filter: (m) => m.author.id === interaction.user.id,
      time: 60000,
    });

    let hintIndex = 2;

    collector?.on('collect', async (m) => {
      if (m.content.toLowerCase() === character.name.toLowerCase()) {
        const winEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} Correct!`)
          .setColor(COLORS.success)
          .setDescription(`The character was ${character.name}!`)
          .setTimestamp();

        await interaction.editReply({ embeds: [winEmbed] });
        collector.stop();
      } else {
        if (hintIndex < character.hints.length) {
          const updateEmbed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} Guess Who Am I`)
            .setColor(COLORS.info)
            .setDescription(`Wrong! Here's another hint:\n\n${character.hints.slice(0, hintIndex + 1).map((h) => `• ${h}`).join('\n')}`)
            .setTimestamp();

          await interaction.editReply({ embeds: [updateEmbed] });
          hintIndex++;
        } else {
          const loseEmbed = new EmbedBuilder()
            .setTitle(`${EMOJIS.error} Game Over`)
            .setColor(COLORS.error)
            .setDescription(`The character was ${character.name}.`)
            .setTimestamp();

          await interaction.editReply({ embeds: [loseEmbed] });
          collector.stop();
        }
      }
    });

    collector?.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Time's Up!`)
          .setColor(COLORS.error)
          .setDescription(`The character was ${character.name}.`)
          .setTimestamp();

        await interaction.editReply({ embeds: [timeoutEmbed] });
      }
    });
  }

  public async executePrefix(message: Message): Promise<void> {
    const character = this.characters[Math.floor(Math.random() * this.characters.length)];
    const hintsToShow = character.hints.slice(0, 2);

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Guess Who Am I`)
      .setColor(COLORS.info)
      .setDescription(`Guess the character from these hints:\n\n${hintsToShow.map((h) => `• ${h}`).join('\n')}`)
      .setTimestamp();

    await message.reply({ embeds: [embed] });

    const collector = message.channel.createMessageCollector({
      filter: (m) => m.author.id === message.author.id,
      time: 60000,
    });

    let hintIndex = 2;

    collector.on('collect', async (m) => {
      if (m.content.toLowerCase() === character.name.toLowerCase()) {
        const winEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} Correct!`)
          .setColor(COLORS.success)
          .setDescription(`The character was ${character.name}!`)
          .setTimestamp();

        await message.edit({ embeds: [winEmbed] });
        collector.stop();
      } else {
        if (hintIndex < character.hints.length) {
          const updateEmbed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} Guess Who Am I`)
            .setColor(COLORS.info)
            .setDescription(`Wrong! Here's another hint:\n\n${character.hints.slice(0, hintIndex + 1).map((h) => `• ${h}`).join('\n')}`)
            .setTimestamp();

          await message.edit({ embeds: [updateEmbed] });
          hintIndex++;
        } else {
          const loseEmbed = new EmbedBuilder()
            .setTitle(`${EMOJIS.error} Game Over`)
            .setColor(COLORS.error)
            .setDescription(`The character was ${character.name}.`)
            .setTimestamp();

          await message.edit({ embeds: [loseEmbed] });
          collector.stop();
        }
      }
    });

    collector.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Time's Up!`)
          .setColor(COLORS.error)
          .setDescription(`The character was ${character.name}.`)
          .setTimestamp();

        await message.edit({ embeds: [timeoutEmbed] });
      }
    });
  }
}

export default GuessWhoAmICommand;
