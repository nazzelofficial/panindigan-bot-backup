import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

const GRID_SIZE = 5;
const SHIP_SIZES = [3, 2, 2]; // sizes of ships to place

type Cell = '🌊' | '🚢' | '💥' | '🌫️';

function createGrid(): Cell[][] {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill('🌊'));
}

function placeShips(grid: Cell[][]): void {
  for (const size of SHIP_SIZES) {
    let placed = false;
    while (!placed) {
      const horiz = Math.random() < 0.5;
      const row = Math.floor(Math.random() * (GRID_SIZE - (horiz ? 0 : size - 1)));
      const col = Math.floor(Math.random() * (GRID_SIZE - (horiz ? size - 1 : 0)));
      const cells = Array.from({ length: size }, (_, i) => horiz ? [row, col + i] : [row + i, col]);
      if (cells.every(([r, c]) => grid[r][c] === '🌊')) {
        cells.forEach(([r, c]) => { grid[r][c] = '🚢'; });
        placed = true;
      }
    }
  }
}

function renderGrid(grid: Cell[][], reveal = false): string {
  const cols = ['A', 'B', 'C', 'D', 'E'];
  const header = '⬛ ' + cols.join('');
  const rows = grid.map((row, i) =>
    `**${i + 1}** ` + row.map(c => reveal ? c : (c === '🚢' ? '🌊' : c)).join('')
  );
  return [header, ...rows].join('\n');
}

function countShips(grid: Cell[][]): number {
  return grid.flat().filter(c => c === '🚢').length;
}

export class BattleshipCommand extends BaseCommand {
  constructor() {
    super({
      name: 'battleship',
      description: 'Play Battleship on a 5×5 grid against the bot',
      category: 'games',
      premiumTier: 'silver',
      cooldown: 5,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['bs', 'naval'],
      examples: ['/battleship', 'p!battleship'],
    } as CommandOptions);
  }

  private async runGame(
    reply: (c: any) => Promise<any>,
    editReply: (c: any) => Promise<any>,
    userId: string,
    channelCollect: any,
  ) {
    const playerGrid = createGrid();
    const botGrid = createGrid();
    placeShips(playerGrid);
    placeShips(botGrid);

    let shots = 0;
    const maxShots = 15;

    const buildEmbed = (ended = false) => {
      const remaining = countShips(botGrid);
      return new EmbedBuilder()
        .setTitle(`${EMOJIS.games} Battleship`)
        .setColor(ended ? (remaining === 0 ? COLORS.success : COLORS.error) : COLORS.info)
        .addFields(
          { name: `🎯 Enemy Waters (${remaining} ship parts left)`, value: renderGrid(botGrid), inline: false },
          { name: `📊 Shots Fired: ${shots}/${maxShots}`, value: ended ? (remaining === 0 ? '🎉 You sank all ships!' : '💀 Out of shots!') : 'Type a coordinate (e.g. `A1`, `C3`) to fire!', inline: false },
        )
        .setTimestamp();
    };

    const buildButtons = (): ActionRowBuilder<ButtonBuilder>[] => {
      const cols = ['A', 'B', 'C', 'D', 'E'];
      const rows: ActionRowBuilder<ButtonBuilder>[] = [];
      for (let r = 0; r < GRID_SIZE; r++) {
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
          cols.map((c, ci) => {
            const cell = botGrid[r][ci];
            const hit = cell === '💥' || cell === '🌫️';
            return new ButtonBuilder()
              .setCustomId(`bs_${r}_${ci}`)
              .setLabel(`${c}${r + 1}`)
              .setStyle(hit ? ButtonStyle.Secondary : ButtonStyle.Primary)
              .setDisabled(hit);
          }),
        );
        rows.push(row);
      }
      return rows;
    };

    await reply({ embeds: [buildEmbed()], components: buildButtons() });

    const collector = channelCollect({
      componentType: ComponentType.Button,
      time: 120000,
      filter: (i: any) => i.user.id === userId,
    });

    collector.on('collect', async (i: any) => {
      const [, r, c] = i.customId.split('_').map(Number);
      const cell = botGrid[r][c];
      shots++;

      if (cell === '🚢') {
        botGrid[r][c] = '💥';
        await i.reply({ content: `💥 Hit at **${['A','B','C','D','E'][c]}${r+1}**!`, ephemeral: true });
      } else {
        botGrid[r][c] = '🌫️';
        await i.reply({ content: `🌊 Miss at **${['A','B','C','D','E'][c]}${r+1}**!`, ephemeral: true });
      }

      const remaining = countShips(botGrid);
      if (remaining === 0 || shots >= maxShots) {
        await i.message.edit({ embeds: [buildEmbed(true)], components: [] });
        collector.stop();
      } else {
        await i.message.edit({ embeds: [buildEmbed()], components: buildButtons() });
      }
    });

    collector.on('end', async (col: any) => {
      if (col.size === 0) await editReply({ embeds: [buildEmbed(true).setFooter({ text: 'Game expired!' })], components: [] });
    });
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await this.runGame(
      (c) => interaction.reply(c),
      (c) => interaction.editReply(c),
      interaction.user.id,
      (o: any) => interaction.channel!.createMessageComponentCollector(o),
    );
  }

  public async executePrefix(message: Message): Promise<void> {
    await this.runGame(
      (c) => message.reply(c),
      async (c) => { const m = await message.reply('...'); return m.edit(c); },
      message.author.id,
      (o: any) => message.channel.createMessageComponentCollector(o),
    );
  }
}

export default BattleshipCommand;
