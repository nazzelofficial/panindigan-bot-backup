import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

const SUITS = ['♠️', '♥️', '♦️', '♣️'];
const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

interface Card { suit: string; value: string; numVal: number; }

function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (let i = 0; i < VALUES.length; i++) {
      deck.push({ suit, value: VALUES[i], numVal: Math.min(i + 2, 14) });
    }
  }
  return deck.sort(() => Math.random() - 0.5);
}

function handStr(cards: Card[]): string {
  return cards.map(c => `${c.value}${c.suit}`).join(' ');
}

function evaluateHand(cards: Card[]): string {
  const values = cards.map(c => c.numVal).sort((a, b) => a - b);
  const suits = cards.map(c => c.suit);
  const isFlush = suits.every(s => s === suits[0]);
  const isStraight = values.every((v, i) => i === 0 || v === values[i - 1] + 1);
  const counts = values.reduce((acc, v) => { acc[v] = (acc[v] || 0) + 1; return acc; }, {} as Record<number, number>);
  const countVals = Object.values(counts).sort((a, b) => b - a);
  if (isFlush && isStraight && values[4] === 14) return '🏆 Royal Flush!';
  if (isFlush && isStraight) return '✨ Straight Flush!';
  if (countVals[0] === 4) return '🎰 Four of a Kind!';
  if (countVals[0] === 3 && countVals[1] === 2) return '🏠 Full House!';
  if (isFlush) return '🌊 Flush!';
  if (isStraight) return '📏 Straight!';
  if (countVals[0] === 3) return '🎯 Three of a Kind!';
  if (countVals[0] === 2 && countVals[1] === 2) return '👥 Two Pair!';
  if (countVals[0] === 2) return '👫 One Pair!';
  return '🃏 High Card';
}

export class PokerCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'poker',
      description: 'Play a simplified 5-card poker hand against the bot',
      category: 'games',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['fivecard'],
      examples: ['/poker 100', 'p!poker 50'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addIntegerOption(o => o.setName('bet').setDescription('Amount to bet (in Piso)').setRequired(false).setMinValue(10).setMaxValue(10000)) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const bet = interaction.options.getInteger('bet') || 50;
    await interaction.deferReply();
    try {
      const prisma = getPrismaClient();
      let userData = await prisma.user.findUnique({ where: { userId: interaction.user.id } });
      if (!userData) {
        userData = await prisma.user.create({ data: { userId: interaction.user.id, balance: 500 } });
      }
      if ((userData.balance || 0) < bet) {
        await interaction.editReply({ content: `${EMOJIS.error} Insufficient funds! You have ₱${userData.balance || 0}.` });
        return;
      }

      const deck = createDeck();
      const playerHand = deck.splice(0, 5);
      const botHand = deck.splice(0, 5);
      const playerEval = evaluateHand(playerHand);
      const botEval = evaluateHand(botHand);

      // Simple comparison: rank by hand strength
      const ranks = ['High Card', 'One Pair', 'Two Pair', 'Three of a Kind', 'Straight', 'Flush', 'Full House', 'Four of a Kind', 'Straight Flush', 'Royal Flush'];
      const pRank = ranks.findIndex(r => playerEval.includes(r));
      const bRank = ranks.findIndex(r => botEval.includes(r));
      const playerWins = pRank > bRank;
      const tie = pRank === bRank;

      let balanceChange = 0;
      let resultText = '';
      if (tie) {
        resultText = '🤝 **Tie!** Your bet is returned.';
      } else if (playerWins) {
        balanceChange = bet;
        resultText = `🎉 **You Win! +₱${bet}**`;
      } else {
        balanceChange = -bet;
        resultText = `😔 **Bot Wins! -₱${bet}**`;
      }

      await prisma.user.update({ where: { userId: interaction.user.id }, data: { balance: { increment: balanceChange } } });
      const newBalance = (userData.balance || 0) + balanceChange;

      const embed = new EmbedBuilder()
        .setTitle(`🃏 5-Card Poker`)
        .setColor(playerWins ? COLORS.success : tie ? COLORS.warning : COLORS.error)
        .addFields(
          { name: `👤 Your Hand (${interaction.user.username})`, value: `${handStr(playerHand)}\n${playerEval}`, inline: false },
          { name: '🤖 Bot\'s Hand', value: `${handStr(botHand)}\n${botEval}`, inline: false },
          { name: '🎲 Result', value: resultText, inline: false },
          { name: '💰 Balance', value: `₱${newBalance.toLocaleString()}`, inline: true },
          { name: '🎯 Bet', value: `₱${bet.toLocaleString()}`, inline: true },
        )
        .setFooter({ text: 'Play again with /poker!' })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (err: any) {
      await interaction.editReply({ content: `${EMOJIS.error} Error: ${err.message}` });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const bet = Math.min(Math.max(parseInt(args[0]) || 50, 10), 10000);
    const deck = createDeck();
    const playerHand = deck.splice(0, 5);
    const botHand = deck.splice(0, 5);
    const playerEval = evaluateHand(playerHand);
    const botEval = evaluateHand(botHand);
    const ranks = ['High Card', 'One Pair', 'Two Pair', 'Three of a Kind', 'Straight', 'Flush', 'Full House', 'Four of a Kind', 'Straight Flush', 'Royal Flush'];
    const playerWins = (ranks.findIndex(r => playerEval.includes(r))) > (ranks.findIndex(r => botEval.includes(r)));
    const embed = new EmbedBuilder()
      .setTitle(`🃏 5-Card Poker`)
      .setColor(playerWins ? COLORS.success : COLORS.error)
      .addFields(
        { name: '👤 Your Hand', value: `${handStr(playerHand)}\n${playerEval}`, inline: false },
        { name: '🤖 Bot Hand', value: `${handStr(botHand)}\n${botEval}`, inline: false },
        { name: '🎲 Result', value: playerWins ? `🎉 You Win! +₱${bet}` : `😔 Bot Wins! -₱${bet}`, inline: false },
      )
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  }
}

export default PokerCommand;
