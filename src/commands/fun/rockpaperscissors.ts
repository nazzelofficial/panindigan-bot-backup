import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class RockPaperScissorsCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'rockpaperscissors',
      description: 'Play rock paper scissors',
      category: 'fun',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['rps'],
      examples: ['/rockpaperscissors', 'p!rockpaperscissors'],
    };
    super(options);
  }

  private choices = ['rock', 'paper', 'scissors'];
  private emojis = { rock: '🪨', paper: '📄', scissors: '✂️' };

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const rock = new ButtonBuilder()
      .setCustomId('rock')
      .setLabel('🪨 Rock')
      .setStyle(ButtonStyle.Primary);

    const paper = new ButtonBuilder()
      .setCustomId('paper')
      .setLabel('📄 Paper')
      .setStyle(ButtonStyle.Secondary);

    const scissors = new ButtonBuilder()
      .setCustomId('scissors')
      .setLabel('✂️ Scissors')
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(rock, paper, scissors);

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 🎮 Rock Paper Scissors`)
      .setColor(COLORS.info)
      .setDescription('Choose your weapon!')
      .setTimestamp();

    await interaction.reply({ embeds: [embed], components: [row] });

    const collector = interaction.channel?.createMessageComponentCollector({
      filter: (i) => i.user.id === interaction.user.id,
      time: 60000,
    });

    collector?.on('collect', async (i) => {
      const userChoice = i.customId;
      const botChoice = this.choices[Math.floor(Math.random() * this.choices.length)];
      
      let result = '';
      let resultColor = COLORS.info;

      if (userChoice === botChoice) {
        result = 'It\'s a tie!';
        resultColor = COLORS.warning;
      } else if (
        (userChoice === 'rock' && botChoice === 'scissors') ||
        (userChoice === 'paper' && botChoice === 'rock') ||
        (userChoice === 'scissors' && botChoice === 'paper')
      ) {
        result = 'You win!';
        resultColor = COLORS.success;
      } else {
        result = 'I win!';
        resultColor = COLORS.error;
      }

      const resultEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.fun} 🎮 Result`)
        .setColor(resultColor)
        .addFields([
          { name: 'Your Choice', value: `${this.emojis[userChoice as keyof typeof this.emojis]} ${userChoice}`, inline: true },
          { name: 'My Choice', value: `${this.emojis[botChoice as keyof typeof this.emojis]} ${botChoice}`, inline: true },
          { name: 'Result', value: result, inline: false },
        ])
        .setTimestamp();

      await i.update({ embeds: [resultEmbed], components: [] });
      collector.stop();
    });

    collector?.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Time's Up!`)
          .setColor(COLORS.error)
          .setDescription('You didn\'t choose in time!')
          .setTimestamp();

        await interaction.editReply({ embeds: [timeoutEmbed], components: [] });
      }
    });
  }

  public async executePrefix(message: Message): Promise<void> {
    const rock = new ButtonBuilder()
      .setCustomId('rock')
      .setLabel('🪨 Rock')
      .setStyle(ButtonStyle.Primary);

    const paper = new ButtonBuilder()
      .setCustomId('paper')
      .setLabel('📄 Paper')
      .setStyle(ButtonStyle.Secondary);

    const scissors = new ButtonBuilder()
      .setCustomId('scissors')
      .setLabel('✂️ Scissors')
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(rock, paper, scissors);

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 🎮 Rock Paper Scissors`)
      .setColor(COLORS.info)
      .setDescription('Choose your weapon!')
      .setTimestamp();

    await message.reply({ embeds: [embed], components: [row] });

    const collector = message.channel.createMessageComponentCollector({
      filter: (i) => i.user.id === message.author.id,
      time: 60000,
    });

    collector.on('collect', async (i) => {
      const userChoice = i.customId;
      const botChoice = this.choices[Math.floor(Math.random() * this.choices.length)];
      
      let result = '';
      let resultColor = COLORS.info;

      if (userChoice === botChoice) {
        result = 'It\'s a tie!';
        resultColor = COLORS.warning;
      } else if (
        (userChoice === 'rock' && botChoice === 'scissors') ||
        (userChoice === 'paper' && botChoice === 'rock') ||
        (userChoice === 'scissors' && botChoice === 'paper')
      ) {
        result = 'You win!';
        resultColor = COLORS.success;
      } else {
        result = 'I win!';
        resultColor = COLORS.error;
      }

      const resultEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.fun} 🎮 Result`)
        .setColor(resultColor)
        .addFields([
          { name: 'Your Choice', value: `${this.emojis[userChoice as keyof typeof this.emojis]} ${userChoice}`, inline: true },
          { name: 'My Choice', value: `${this.emojis[botChoice as keyof typeof this.emojis]} ${botChoice}`, inline: true },
          { name: 'Result', value: result, inline: false },
        ])
        .setTimestamp();

      await i.update({ embeds: [resultEmbed], components: [] });
      collector.stop();
    });

    collector.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Time's Up!`)
          .setColor(COLORS.error)
          .setDescription('You didn\'t choose in time!')
          .setTimestamp();

        await message.edit({ embeds: [timeoutEmbed], components: [] });
      }
    });
  }
}

export default RockPaperScissorsCommand;
