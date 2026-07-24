import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

const UNO_COLORS = ['🔴 Red', '🔵 Blue', '🟡 Yellow', '🟢 Green'];
const UNO_VALUES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Skip', 'Reverse', '+2'];
const UNO_WILD = ['🃏 Wild', '🃏 Wild +4'];

interface UnoCard { color: string; value: string; display: string; }

function createUnoDeck(): UnoCard[] {
  const deck: UnoCard[] = [];
  for (const color of UNO_COLORS) {
    for (const value of UNO_VALUES) {
      deck.push({ color, value, display: `${color} ${value}` });
      if (value !== '0') deck.push({ color, value, display: `${color} ${value}` });
    }
  }
  for (const wild of UNO_WILD) {
    for (let i = 0; i < 4; i++) deck.push({ color: '⬛ Wild', value: wild, display: wild });
  }
  return deck.sort(() => Math.random() - 0.5);
}

function drawCards(deck: UnoCard[], count: number): UnoCard[] {
  return deck.splice(0, count);
}

export class UnoCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'uno',
      description: 'Play a simplified UNO game against the bot',
      category: 'games',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['unocards'],
      examples: ['/uno', 'p!uno'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();

    const deck = createUnoDeck();
    const playerHand = drawCards(deck, 7);
    const botHand = drawCards(deck, 7);
    const topCard = drawCards(deck, 1)[0];

    const buildGameEmbed = (playerCards: UnoCard[], botCardCount: number, top: UnoCard, turn: 'player' | 'bot', message?: string) =>
      new EmbedBuilder()
        .setTitle(`🃏 UNO!`)
        .setColor(COLORS.warning)
        .setDescription(message || (turn === 'player' ? '**Your turn!** Choose a card to play.' : '**Bot\'s turn...**'))
        .addFields(
          { name: '📋 Top Card', value: top.display, inline: true },
          { name: '🤖 Bot Cards', value: `**${botCardCount}** cards`, inline: true },
          { name: `👤 Your Hand (${playerCards.length} cards)`, value: playerCards.map((c, i) => `\`${i + 1}.\` ${c.display}`).join('\n') || 'No cards', inline: false }
        )
        .setFooter({ text: 'UNO! | Click a card number button to play' })
        .setTimestamp();

    const buildCardButtons = (cards: UnoCard[], top: UnoCard): ActionRowBuilder<ButtonBuilder>[] => {
      const playable = cards.filter(c => c.color === top.color || c.value === top.value || c.color === '⬛ Wild');
      const rows: ActionRowBuilder<ButtonBuilder>[] = [];
      let row = new ActionRowBuilder<ButtonBuilder>();
      let count = 0;
      for (let i = 0; i < cards.length && count < 5; i++) {
        if (playable.includes(cards[i])) {
          row.addComponents(
            new ButtonBuilder()
              .setCustomId(`uno_play_${i}`)
              .setLabel(`${cards[i].value} (${i + 1})`)
              .setStyle(ButtonStyle.Primary)
          );
          count++;
          if (count % 5 === 0) { rows.push(row); row = new ActionRowBuilder<ButtonBuilder>(); }
        }
      }
      row.addComponents(new ButtonBuilder().setCustomId('uno_draw').setLabel('Draw Card').setStyle(ButtonStyle.Secondary).setEmoji('🃏'));
      rows.push(row);
      return rows.slice(0, 5);
    };

    let pHand = [...playerHand];
    let bHand = [...botHand];
    let top = { ...topCard };
    let turn: 'player' | 'bot' = 'player';

    const embed = buildGameEmbed(pHand, bHand.length, top, turn);
    const buttons = buildCardButtons(pHand, top);
    const reply = await interaction.editReply({ embeds: [embed], components: buttons });

    const collector = reply.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000, filter: (i) => i.user.id === interaction.user.id });

    collector.on('collect', async (btn) => {
      await btn.deferUpdate();
      if (btn.customId === 'uno_draw') {
        const drawn = drawCards(deck, 1);
        pHand.push(...drawn);
        turn = 'bot';
      } else {
        const idx = parseInt(btn.customId.replace('uno_play_', ''));
        const played = pHand.splice(idx, 1)[0];
        top = played;
        if (pHand.length === 0) {
          await btn.editReply({ embeds: [buildGameEmbed(pHand, bHand.length, top, 'player', '🎉 **You win! UNO!**')], components: [] });
          collector.stop('win');
          return;
        }
        turn = 'bot';
      }

      // Bot turn
      if (turn === 'bot') {
        const playable = bHand.filter(c => c.color === top.color || c.value === top.value || c.color === '⬛ Wild');
        if (playable.length > 0) {
          const botPlay = playable[0];
          bHand = bHand.filter(c => c !== botPlay);
          top = botPlay;
        } else {
          bHand.push(...drawCards(deck, 1));
        }
        if (bHand.length === 0) {
          await btn.editReply({ embeds: [buildGameEmbed(pHand, 0, top, 'player', '😔 **Bot wins! UNO!**')], components: [] });
          collector.stop('bot_win');
          return;
        }
        turn = 'player';
      }

      const newEmbed = buildGameEmbed(pHand, bHand.length, top, turn);
      const newButtons = buildCardButtons(pHand, top);
      await btn.editReply({ embeds: [newEmbed], components: newButtons });
    });

    collector.on('end', (_, reason) => {
      if (!['win', 'bot_win'].includes(reason)) {
        reply.edit({ components: [] }).catch(() => {});
      }
    });
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const deck = createUnoDeck();
    const playerHand = drawCards(deck, 7);
    const topCard = drawCards(deck, 1)[0];
    const embed = new EmbedBuilder()
      .setTitle(`🃏 UNO — Your Hand`)
      .setColor(COLORS.warning)
      .setDescription('Use `/uno` for the interactive version with buttons!\n\nHere\'s a sample deal:')
      .addFields(
        { name: '📋 Top Card', value: topCard.display, inline: false },
        { name: '🎴 Your Hand', value: playerHand.map(c => c.display).join('\n'), inline: false }
      )
      .setFooter({ text: 'Use /uno for the full interactive game!' })
      .setTimestamp();
    await message.reply({ embeds: [embed] });
  }
}

export default UnoCommand;
