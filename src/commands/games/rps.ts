// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, ComponentType, ButtonStyle, ActionRowBuilder, ButtonBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class RPSCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'rps',
      description: 'Play rock-paper-scissors against the bot',
      category: 'games',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['rockpaperscissors', 'rpsgame'],
      examples: ['/rps', 'p!rps'],
    };
    super(options);
  }

  private choices = ['rock', 'paper', 'scissors'];
  private emojis = { rock: '🪨', paper: '📄', scissors: '✂️' };

  private determineWinner(player: string, bot: string): string {
    if (player === bot) return 'tie';
    if (
      (player === 'rock' && bot === 'scissors') ||
      (player === 'paper' && bot === 'rock') ||
      (player === 'scissors' && bot === 'paper')
    ) {
      return 'player';
    }
    return 'bot';
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        this.choices.map((choice) =>
          new ButtonBuilder()
            .setCustomId(`rps_${choice}`)
            .setLabel(choice.charAt(0).toUpperCase() + choice.slice(1))
            .setStyle(ButtonStyle.Primary)
        )
      );

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Rock-Paper-Scissors`)
      .setColor(COLORS.info)
      .setDescription('Choose your move!')
      .setTimestamp();

    await interaction.reply({ embeds: [embed], components: [row] });

    const collector = interaction.channel?.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 30000,
    });

    collector?.on('collect', async (i) => {
      const playerChoice = i.customId.split('_')[1];
      const botChoice = this.choices[Math.floor(Math.random() * this.choices.length)];
      const winner = this.determineWinner(playerChoice, botChoice);

      let resultEmbed: EmbedBuilder;
      if (winner === 'tie') {
        resultEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} It's a Tie!`)
          .setColor(COLORS.info)
          .setDescription(`${this.emojis[playerChoice as keyof typeof this.emojis]} vs ${this.emojis[botChoice as keyof typeof this.emojis]}`)
          .setTimestamp();
      } else if (winner === 'player') {
        resultEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} You Win!`)
          .setColor(COLORS.success)
          .setDescription(`${this.emojis[playerChoice as keyof typeof this.emojis]} beats ${this.emojis[botChoice as keyof typeof this.emojis]}`)
          .setTimestamp();
      } else {
        resultEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} You Lose!`)
          .setColor(COLORS.error)
          .setDescription(`${this.emojis[botChoice as keyof typeof this.emojis]} beats ${this.emojis[playerChoice as keyof typeof this.emojis]}`)
          .setTimestamp();
      }

      await i.update({ embeds: [resultEmbed], components: [] });
      collector.stop();
    });

    collector?.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Time's Up!`)
          .setColor(COLORS.error)
          .setDescription('You didn\'t make a choice in time.')
          .setTimestamp();

        await interaction.editReply({ embeds: [timeoutEmbed], components: [] });
      }
    });
  }

  public async executePrefix(message: Message): Promise<void> {
    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        this.choices.map((choice) =>
          new ButtonBuilder()
            .setCustomId(`rps_${choice}`)
            .setLabel(choice.charAt(0).toUpperCase() + choice.slice(1))
            .setStyle(ButtonStyle.Primary)
        )
      );

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Rock-Paper-Scissors`)
      .setColor(COLORS.info)
      .setDescription('Choose your move!')
      .setTimestamp();

    await message.reply({ embeds: [embed], components: [row] });

    const collector = message.channel.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 30000,
    });

    collector.on('collect', async (i) => {
      const playerChoice = i.customId.split('_')[1];
      const botChoice = this.choices[Math.floor(Math.random() * this.choices.length)];
      const winner = this.determineWinner(playerChoice, botChoice);

      let resultEmbed: EmbedBuilder;
      if (winner === 'tie') {
        resultEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} It's a Tie!`)
          .setColor(COLORS.info)
          .setDescription(`${this.emojis[playerChoice as keyof typeof this.emojis]} vs ${this.emojis[botChoice as keyof typeof this.emojis]}`)
          .setTimestamp();
      } else if (winner === 'player') {
        resultEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} You Win!`)
          .setColor(COLORS.success)
          .setDescription(`${this.emojis[playerChoice as keyof typeof this.emojis]} beats ${this.emojis[botChoice as keyof typeof this.emojis]}`)
          .setTimestamp();
      } else {
        resultEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} You Lose!`)
          .setColor(COLORS.error)
          .setDescription(`${this.emojis[botChoice as keyof typeof this.emojis]} beats ${this.emojis[playerChoice as keyof typeof this.emojis]}`)
          .setTimestamp();
      }

      await i.update({ embeds: [resultEmbed], components: [] });
      collector.stop();
    });

    collector.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Time's Up!`)
          .setColor(COLORS.error)
          .setDescription('You didn\'t make a choice in time.')
          .setTimestamp();

        await message.edit({ embeds: [timeoutEmbed], components: [] });
      }
    });
  }
}

export default RPSCommand;
