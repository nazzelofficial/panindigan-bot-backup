import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, ComponentType, ButtonStyle, ActionRowBuilder, ButtonBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class BlackjackGameCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'blackjackgame',
      description: 'Play blackjack against the bot',
      category: 'games',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['bj', 'blackjack'],
      examples: ['/blackjackgame', 'p!blackjackgame'],
    };
    super(options);
  }

  private deck: string[] = [];
  private playerHand: string[] = [];
  private dealerHand: string[] = [];
  private gameOver = false;

  private initializeDeck(): void {
    const suits = ['♠', '♥', '♦', '♣'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    this.deck = [];

    for (const suit of suits) {
      for (const value of values) {
        this.deck.push(`${value}${suit}`);
      }
    }

    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  private dealCard(): string {
    return this.deck.pop() || '';
  }

  private calculateHand(hand: string[]): number {
    let total = 0;
    let aces = 0;

    for (const card of hand) {
      const value = card.slice(0, -1);
      if (value === 'A') {
        aces++;
        total += 11;
      } else if (['K', 'Q', 'J'].includes(value)) {
        total += 10;
      } else {
        total += parseInt(value);
      }
    }

    while (total > 21 && aces > 0) {
      total -= 10;
      aces--;
    }

    return total;
  }

  private initializeGame(): void {
    this.initializeDeck();
    this.playerHand = [this.dealCard(), this.dealCard()];
    this.dealerHand = [this.dealCard(), this.dealCard()];
    this.gameOver = false;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    this.initializeGame();

    const createButtons = () => {
      const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder().setCustomId('bj_hit').setLabel('Hit').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId('bj_stand').setLabel('Stand').setStyle(ButtonStyle.Danger)
        );
      return [row];
    };

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Blackjack`)
      .setColor(COLORS.info)
      .setDescription(`Your hand: ${this.playerHand.join(' ')} (${this.calculateHand(this.playerHand)})\nDealer's hand: ${this.dealerHand[0]} ?`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed], components: createButtons() });

    const collector = interaction.channel?.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 300000,
    });

    collector?.on('collect', async (i) => {
      const action = i.customId.split('_')[1];

      if (action === 'hit') {
        this.playerHand.push(this.dealCard());
        const playerTotal = this.calculateHand(this.playerHand);

        if (playerTotal > 21) {
          this.gameOver = true;
          const bustEmbed = new EmbedBuilder()
            .setTitle(`${EMOJIS.error} Bust!`)
            .setColor(COLORS.error)
            .setDescription(`Your hand: ${this.playerHand.join(' ')} (${playerTotal})\nDealer's hand: ${this.dealerHand.join(' ')} (${this.calculateHand(this.dealerHand)})`)
            .setTimestamp();

          await i.update({ embeds: [bustEmbed], components: [] });
          collector.stop();
        } else {
          const updateEmbed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} Blackjack`)
            .setColor(COLORS.info)
            .setDescription(`Your hand: ${this.playerHand.join(' ')} (${playerTotal})\nDealer's hand: ${this.dealerHand[0]} ?`)
            .setTimestamp();

          await i.update({ embeds: [updateEmbed], components: createButtons() });
        }
      } else if (action === 'stand') {
        while (this.calculateHand(this.dealerHand) < 17) {
          this.dealerHand.push(this.dealCard());
        }

        const playerTotal = this.calculateHand(this.playerHand);
        const dealerTotal = this.calculateHand(this.dealerHand);

        let resultEmbed: EmbedBuilder;
        if (dealerTotal > 21) {
          resultEmbed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} You Win!`)
            .setColor(COLORS.success)
            .setDescription(`Your hand: ${this.playerHand.join(' ')} (${playerTotal})\nDealer's hand: ${this.dealerHand.join(' ')} (${dealerTotal})\nDealer busts!`)
            .setTimestamp();
        } else if (playerTotal > dealerTotal) {
          resultEmbed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} You Win!`)
            .setColor(COLORS.success)
            .setDescription(`Your hand: ${this.playerHand.join(' ')} (${playerTotal})\nDealer's hand: ${this.dealerHand.join(' ')} (${dealerTotal})`)
            .setTimestamp();
        } else if (playerTotal < dealerTotal) {
          resultEmbed = new EmbedBuilder()
            .setTitle(`${EMOJIS.error} You Lose!`)
            .setColor(COLORS.error)
            .setDescription(`Your hand: ${this.playerHand.join(' ')} (${playerTotal})\nDealer's hand: ${this.dealerHand.join(' ')} (${dealerTotal})`)
            .setTimestamp();
        } else {
          resultEmbed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} It's a Tie!`)
            .setColor(COLORS.info)
            .setDescription(`Your hand: ${this.playerHand.join(' ')} (${playerTotal})\nDealer's hand: ${this.dealerHand.join(' ')} (${dealerTotal})`)
            .setTimestamp();
        }

        await i.update({ embeds: [resultEmbed], components: [] });
        collector.stop();
      }
    });

    collector?.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Game Ended`)
          .setColor(COLORS.error)
          .setDescription('Game timed out.')
          .setTimestamp();

        await interaction.editReply({ embeds: [timeoutEmbed], components: [] });
      }
    });
  }

  public async executePrefix(message: Message): Promise<void> {
    this.initializeGame();

    const createButtons = () => {
      const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder().setCustomId('bj_hit').setLabel('Hit').setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId('bj_stand').setLabel('Stand').setStyle(ButtonStyle.Danger)
        );
      return [row];
    };

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Blackjack`)
      .setColor(COLORS.info)
      .setDescription(`Your hand: ${this.playerHand.join(' ')} (${this.calculateHand(this.playerHand)})\nDealer's hand: ${this.dealerHand[0]} ?`)
      .setTimestamp();

    await message.reply({ embeds: [embed], components: createButtons() });

    const collector = message.channel.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 300000,
    });

    collector.on('collect', async (i) => {
      const action = i.customId.split('_')[1];

      if (action === 'hit') {
        this.playerHand.push(this.dealCard());
        const playerTotal = this.calculateHand(this.playerHand);

        if (playerTotal > 21) {
          this.gameOver = true;
          const bustEmbed = new EmbedBuilder()
            .setTitle(`${EMOJIS.error} Bust!`)
            .setColor(COLORS.error)
            .setDescription(`Your hand: ${this.playerHand.join(' ')} (${playerTotal})\nDealer's hand: ${this.dealerHand.join(' ')} (${this.calculateHand(this.dealerHand)})`)
            .setTimestamp();

          await i.update({ embeds: [bustEmbed], components: [] });
          collector.stop();
        } else {
          const updateEmbed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} Blackjack`)
            .setColor(COLORS.info)
            .setDescription(`Your hand: ${this.playerHand.join(' ')} (${playerTotal})\nDealer's hand: ${this.dealerHand[0]} ?`)
            .setTimestamp();

          await i.update({ embeds: [updateEmbed], components: createButtons() });
        }
      } else if (action === 'stand') {
        while (this.calculateHand(this.dealerHand) < 17) {
          this.dealerHand.push(this.dealCard());
        }

        const playerTotal = this.calculateHand(this.playerHand);
        const dealerTotal = this.calculateHand(this.dealerHand);

        let resultEmbed: EmbedBuilder;
        if (dealerTotal > 21) {
          resultEmbed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} You Win!`)
            .setColor(COLORS.success)
            .setDescription(`Your hand: ${this.playerHand.join(' ')} (${playerTotal})\nDealer's hand: ${this.dealerHand.join(' ')} (${dealerTotal})\nDealer busts!`)
            .setTimestamp();
        } else if (playerTotal > dealerTotal) {
          resultEmbed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} You Win!`)
            .setColor(COLORS.success)
            .setDescription(`Your hand: ${this.playerHand.join(' ')} (${playerTotal})\nDealer's hand: ${this.dealerHand.join(' ')} (${dealerTotal})`)
            .setTimestamp();
        } else if (playerTotal < dealerTotal) {
          resultEmbed = new EmbedBuilder()
            .setTitle(`${EMOJIS.error} You Lose!`)
            .setColor(COLORS.error)
            .setDescription(`Your hand: ${this.playerHand.join(' ')} (${playerTotal})\nDealer's hand: ${this.dealerHand.join(' ')} (${dealerTotal})`)
            .setTimestamp();
        } else {
          resultEmbed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} It's a Tie!`)
            .setColor(COLORS.info)
            .setDescription(`Your hand: ${this.playerHand.join(' ')} (${playerTotal})\nDealer's hand: ${this.dealerHand.join(' ')} (${dealerTotal})`)
            .setTimestamp();
        }

        await i.update({ embeds: [resultEmbed], components: [] });
        collector.stop();
      }
    });

    collector.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Game Ended`)
          .setColor(COLORS.error)
          .setDescription('Game timed out.')
          .setTimestamp();

        await message.edit({ embeds: [timeoutEmbed], components: [] });
      }
    });
  }
}

export default BlackjackGameCommand;
