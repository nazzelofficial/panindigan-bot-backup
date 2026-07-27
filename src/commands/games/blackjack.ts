// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import {
  ChatInputCommandInteraction, Message, EmbedBuilder,
  ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType,
} from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

type Card = { suit: string; value: string; points: number };

function makeDeck(): Card[] {
  const suits = ['♠', '♥', '♦', '♣'];
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const deck: Card[] = [];
  for (const suit of suits) {
    for (const value of values) {
      const pts = ['J', 'Q', 'K'].includes(value) ? 10 : value === 'A' ? 11 : parseInt(value);
      deck.push({ suit, value, points: pts });
    }
  }
  return deck.sort(() => Math.random() - 0.5);
}

function handTotal(hand: Card[]): number {
  let total = hand.reduce((s, c) => s + c.points, 0);
  let aces = hand.filter(c => c.value === 'A').length;
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return total;
}

function handStr(hand: Card[], hideSecond = false): string {
  return hand.map((c, i) => (hideSecond && i === 1) ? '🂠' : `${c.value}${c.suit}`).join(' ');
}

export class BlackjackCommand extends BaseCommand {
  constructor() {
    super({
      name: 'blackjack',
      description: 'Play a game of Blackjack against the dealer',
      category: 'games',
      premiumTier: 'bronze',
      cooldown: 5,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['bj', '21'],
      examples: ['/blackjack', 'p!blackjack'],
    } as CommandOptions);
  }

  private async runGame(
    reply: (content: any) => Promise<any>,
    editReply: (content: any) => Promise<any>,
    userId: string,
    channelCollect: any,
  ) {
    const deck = makeDeck();
    const playerHand: Card[] = [deck.pop()!, deck.pop()!];
    const dealerHand: Card[] = [deck.pop()!, deck.pop()!];

    const buildEmbed = (ended = false, result = '') => {
      const playerTotal = handTotal(playerHand);
      const dealerTotal = ended ? handTotal(dealerHand) : handTotal([dealerHand[0]]);
      return new EmbedBuilder()
        .setTitle(`${EMOJIS.games} Blackjack`)
        .setColor(ended ? (result === 'win' ? COLORS.success : result === 'lose' ? COLORS.error : COLORS.warning) : COLORS.info)
        .addFields(
          { name: `🤵 Dealer (${ended ? dealerTotal : '?'})`, value: handStr(dealerHand, !ended), inline: false },
          { name: `👤 You (${playerTotal})`, value: handStr(playerHand), inline: false },
          ...(result ? [{ name: '🏆 Result', value: result === 'win' ? '🎉 You Win!' : result === 'lose' ? '💀 Dealer Wins!' : '🤝 It\'s a Tie!', inline: false }] : []),
        )
        .setTimestamp();
    };

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId('bj_hit').setLabel('👆 Hit').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('bj_stand').setLabel('🛑 Stand').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId('bj_double').setLabel('💰 Double').setStyle(ButtonStyle.Secondary),
    );

    const msg = await reply({ embeds: [buildEmbed()], components: [row] });

    const collector = channelCollect({
      componentType: ComponentType.Button,
      time: 60000,
      filter: (i: any) => i.user.id === userId && ['bj_hit', 'bj_stand', 'bj_double'].includes(i.customId),
    });

    collector.on('collect', async (i: any) => {
      if (i.customId === 'bj_hit' || i.customId === 'bj_double') {
        playerHand.push(deck.pop()!);
        if (handTotal(playerHand) > 21) {
          await i.update({ embeds: [buildEmbed(true, 'lose')], components: [] });
          collector.stop();
          return;
        }
        if (i.customId === 'bj_double') {
          // auto-stand after double
          while (handTotal(dealerHand) < 17) dealerHand.push(deck.pop()!);
          const p = handTotal(playerHand), d = handTotal(dealerHand);
          const result = d > 21 || p > d ? 'win' : p < d ? 'lose' : 'tie';
          await i.update({ embeds: [buildEmbed(true, result)], components: [] });
          collector.stop();
          return;
        }
        await i.update({ embeds: [buildEmbed()], components: [row] });
      } else if (i.customId === 'bj_stand') {
        while (handTotal(dealerHand) < 17) dealerHand.push(deck.pop()!);
        const p = handTotal(playerHand), d = handTotal(dealerHand);
        const result = d > 21 || p > d ? 'win' : p < d ? 'lose' : 'tie';
        await i.update({ embeds: [buildEmbed(true, result)], components: [] });
        collector.stop();
      }
    });

    collector.on('end', async (col: any) => {
      if (col.size === 0) await editReply({ embeds: [buildEmbed(true, 'lose').setFooter({ text: 'Time\'s up — dealer wins.' })], components: [] });
    });
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await this.runGame(
      (c) => interaction.reply(c),
      (c) => interaction.editReply(c),
      interaction.user.id,
      (opts: any) => interaction.channel!.createMessageComponentCollector(opts),
    );
  }

  public async executePrefix(message: Message): Promise<void> {
    await this.runGame(
      (c) => message.reply(c),
      async (c) => { const m = await message.reply('...'); return m.edit(c); },
      message.author.id,
      (opts: any) => message.channel.createMessageComponentCollector(opts),
    );
  }
}

export default BlackjackCommand;
