import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import {
  ChatInputCommandInteraction, Message, EmbedBuilder,
  ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType,
} from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

const RED_NUMBERS = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];

function spinWheel(): number { return Math.floor(Math.random() * 37); } // 0-36
function getColor(n: number): string { return n === 0 ? '🟢' : RED_NUMBERS.includes(n) ? '🔴' : '⚫'; }
function isEven(n: number): boolean { return n !== 0 && n % 2 === 0; }

function evaluateBet(bet: string, result: number): { won: boolean; multiplier: number } {
  if (bet === 'red') return { won: RED_NUMBERS.includes(result), multiplier: 2 };
  if (bet === 'black') return { won: !RED_NUMBERS.includes(result) && result !== 0, multiplier: 2 };
  if (bet === 'even') return { won: isEven(result), multiplier: 2 };
  if (bet === 'odd') return { won: !isEven(result) && result !== 0, multiplier: 2 };
  if (bet === '1-18') return { won: result >= 1 && result <= 18, multiplier: 2 };
  if (bet === '19-36') return { won: result >= 19 && result <= 36, multiplier: 2 };
  if (bet === '1-12') return { won: result >= 1 && result <= 12, multiplier: 3 };
  if (bet === '13-24') return { won: result >= 13 && result <= 24, multiplier: 3 };
  if (bet === '25-36') return { won: result >= 25 && result <= 36, multiplier: 3 };
  // straight-up number
  const num = parseInt(bet);
  if (!isNaN(num)) return { won: result === num, multiplier: 36 };
  return { won: false, multiplier: 0 };
}

export class RouletteCommand extends BaseCommand {
  constructor() {
    super({
      name: 'roulette',
      description: 'Play roulette with inside and outside bets',
      category: 'games',
      premiumTier: 'bronze',
      cooldown: 5,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['wheel', 'spin'],
      examples: ['/roulette', 'p!roulette red', 'p!roulette 17'],
    } as CommandOptions);
  }

  private async runRoulette(
    reply: (c: any) => Promise<any>,
    editReply: (c: any) => Promise<any>,
    userId: string,
    channelCollect: any,
    presetBet?: string,
  ) {
    const outsideBets = [
      { id: 'r_red', label: '🔴 Red', style: ButtonStyle.Danger, bet: 'red' },
      { id: 'r_black', label: '⚫ Black', style: ButtonStyle.Secondary, bet: 'black' },
      { id: 'r_even', label: '2️⃣ Even', style: ButtonStyle.Primary, bet: 'even' },
      { id: 'r_odd', label: '1️⃣ Odd', style: ButtonStyle.Primary, bet: 'odd' },
      { id: 'r_low', label: '⬇️ 1-18', style: ButtonStyle.Secondary, bet: '1-18' },
      { id: 'r_high', label: '⬆️ 19-36', style: ButtonStyle.Secondary, bet: '19-36' },
    ];

    if (presetBet) {
      const result = spinWheel();
      const { won, multiplier } = evaluateBet(presetBet, result);
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.games} Roulette`)
        .setColor(won ? COLORS.success : COLORS.error)
        .setDescription(`The wheel lands on **${getColor(result)} ${result}**!\n\nYour bet: **${presetBet}** — ${won ? `🎉 Won! (${multiplier}x)` : '😢 Lost!'}`)
        .setTimestamp();
      await reply({ embeds: [embed] });
      return;
    }

    const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
      outsideBets.slice(0, 3).map(b => new ButtonBuilder().setCustomId(b.id).setLabel(b.label).setStyle(b.style)),
    );
    const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
      outsideBets.slice(3).map(b => new ButtonBuilder().setCustomId(b.id).setLabel(b.label).setStyle(b.style)),
    );

    const promptEmbed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Roulette`)
      .setColor(COLORS.info)
      .setDescription('🎰 Choose your bet! You have 30 seconds.\n\nOr use `p!roulette <bet>` (e.g. `p!roulette red`, `p!roulette 17`).')
      .setTimestamp();

    await reply({ embeds: [promptEmbed], components: [row1, row2] });

    const collector = channelCollect({
      componentType: ComponentType.Button,
      time: 30000,
      filter: (i: any) => i.user.id === userId,
    });

    collector.on('collect', async (i: any) => {
      const betData = outsideBets.find(b => b.id === i.customId);
      if (!betData) return;
      const result = spinWheel();
      const { won, multiplier } = evaluateBet(betData.bet, result);
      const resultEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.games} Roulette`)
        .setColor(won ? COLORS.success : COLORS.error)
        .setDescription(`The wheel lands on **${getColor(result)} ${result}**!\n\nYour bet: **${betData.bet}** — ${won ? `🎉 Won! (${multiplier}x)` : '😢 Lost!'}`)
        .setTimestamp();
      await i.update({ embeds: [resultEmbed], components: [] });
      collector.stop();
    });

    collector.on('end', async (col: any) => {
      if (col.size === 0) await editReply({ embeds: [promptEmbed.setFooter({ text: 'Time\'s up!' })], components: [] });
    });
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await this.runRoulette(
      (c) => interaction.reply(c),
      (c) => interaction.editReply(c),
      interaction.user.id,
      (o: any) => interaction.channel!.createMessageComponentCollector(o),
    );
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const bet = args[0];
    await this.runRoulette(
      (c) => message.reply(c),
      async (c) => { const m = await message.reply('...'); return m.edit(c); },
      message.author.id,
      (o: any) => message.channel.createMessageComponentCollector(o),
      bet,
    );
  }
}

export default RouletteCommand;
