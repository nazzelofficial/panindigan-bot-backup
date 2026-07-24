import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, ComponentType, ButtonStyle, ActionRowBuilder, ButtonBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class MemoryGameCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'memorygame',
      description: 'Play a memory matching game',
      category: 'games',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['memory', 'match'],
      examples: ['/memorygame', 'p!memorygame'],
    };
    super(options);
  }

  private emojis = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍒'];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const selectedEmojis = this.emojis.slice(0, 4);
    const cards = [...selectedEmojis, ...selectedEmojis].sort(() => Math.random() - 0.5);
    const revealed = Array(8).fill(false);
    const matched = Array(8).fill(false);
    let firstCard: number | null = null;
    let moves = 0;

    const displayBoard = () => {
      return cards.map((card, index) => {
        if (revealed[index] || matched[index]) {
          return card;
        }
        return '❓';
      }).join(' ');
    };

    const createButtons = () => {
      const row = new ActionRowBuilder<ButtonBuilder>();
      for (let i = 0; i < 8; i++) {
        const label = revealed[i] || matched[i] ? cards[i] : '❓';
        const style = matched[i] ? ButtonStyle.Success : (revealed[i] ? ButtonStyle.Primary : ButtonStyle.Secondary);
        row.addComponents(
          new ButtonBuilder()
            .setCustomId(`memory_${i}`)
            .setLabel(label)
            .setStyle(style)
            .setDisabled(matched[i] || revealed[i])
        );
      }
      return row;
    };

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Memory Game`)
      .setColor(COLORS.info)
      .setDescription(`Match the pairs! Moves: ${moves}\n\n${displayBoard()}`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed], components: [createButtons()] });

    const collector = interaction.channel?.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 120000,
    });

    collector?.on('collect', async (i) => {
      const index = parseInt(i.customId.split('_')[1]);

      if (firstCard === null) {
        firstCard = index;
        revealed[index] = true;
        const updateEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} Memory Game`)
          .setColor(COLORS.info)
          .setDescription(`Match the pairs! Moves: ${moves}\n\n${displayBoard()}`)
          .setTimestamp();

        await i.update({ embeds: [updateEmbed], components: [createButtons()] });
      } else {
        moves++;
        revealed[index] = true;

        if (cards[firstCard] === cards[index]) {
          matched[firstCard] = true;
          matched[index] = true;
          firstCard = null;

          if (matched.every((m) => m)) {
            const winEmbed = new EmbedBuilder()
              .setTitle(`${EMOJIS.games} You Won!`)
              .setColor(COLORS.success)
              .setDescription(`You matched all pairs in ${moves} moves!`)
              .setTimestamp();

            await i.update({ embeds: [winEmbed], components: [] });
            collector.stop();
          } else {
            const updateEmbed = new EmbedBuilder()
              .setTitle(`${EMOJIS.games} Memory Game`)
              .setColor(COLORS.success)
              .setDescription(`Match found! Moves: ${moves}\n\n${displayBoard()}`)
              .setTimestamp();

            await i.update({ embeds: [updateEmbed], components: [createButtons()] });
          }
        } else {
          const updateEmbed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} Memory Game`)
            .setColor(COLORS.info)
            .setDescription(`No match! Moves: ${moves}\n\n${displayBoard()}`)
            .setTimestamp();

          await i.update({ embeds: [updateEmbed], components: [createButtons()] });

          setTimeout(() => {
            revealed[firstCard!] = false;
            revealed[index] = false;
            firstCard = null;
            const resetEmbed = new EmbedBuilder()
              .setTitle(`${EMOJIS.games} Memory Game`)
              .setColor(COLORS.info)
              .setDescription(`Match the pairs! Moves: ${moves}\n\n${displayBoard()}`)
              .setTimestamp();

            interaction.editReply({ embeds: [resetEmbed], components: [createButtons()] });
          }, 1000);
        }
      }
    });

    collector?.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Time's Up!`)
          .setColor(COLORS.error)
          .setDescription('Game timed out.')
          .setTimestamp();

        await interaction.editReply({ embeds: [timeoutEmbed], components: [] });
      }
    });
  }

  public async executePrefix(message: Message): Promise<void> {
    const selectedEmojis = this.emojis.slice(0, 4);
    const cards = [...selectedEmojis, ...selectedEmojis].sort(() => Math.random() - 0.5);
    const revealed = Array(8).fill(false);
    const matched = Array(8).fill(false);
    let firstCard: number | null = null;
    let moves = 0;

    const displayBoard = () => {
      return cards.map((card, index) => {
        if (revealed[index] || matched[index]) {
          return card;
        }
        return '❓';
      }).join(' ');
    };

    const createButtons = () => {
      const row = new ActionRowBuilder<ButtonBuilder>();
      for (let i = 0; i < 8; i++) {
        const label = revealed[i] || matched[i] ? cards[i] : '❓';
        const style = matched[i] ? ButtonStyle.Success : (revealed[i] ? ButtonStyle.Primary : ButtonStyle.Secondary);
        row.addComponents(
          new ButtonBuilder()
            .setCustomId(`memory_${i}`)
            .setLabel(label)
            .setStyle(style)
            .setDisabled(matched[i] || revealed[i])
        );
      }
      return row;
    };

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Memory Game`)
      .setColor(COLORS.info)
      .setDescription(`Match the pairs! Moves: ${moves}\n\n${displayBoard()}`)
      .setTimestamp();

    await message.reply({ embeds: [embed], components: [createButtons()] });

    const collector = message.channel.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 120000,
    });

    collector.on('collect', async (i) => {
      const index = parseInt(i.customId.split('_')[1]);

      if (firstCard === null) {
        firstCard = index;
        revealed[index] = true;
        const updateEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} Memory Game`)
          .setColor(COLORS.info)
          .setDescription(`Match the pairs! Moves: ${moves}\n\n${displayBoard()}`)
          .setTimestamp();

        await i.update({ embeds: [updateEmbed], components: [createButtons()] });
      } else {
        moves++;
        revealed[index] = true;

        if (cards[firstCard] === cards[index]) {
          matched[firstCard] = true;
          matched[index] = true;
          firstCard = null;

          if (matched.every((m) => m)) {
            const winEmbed = new EmbedBuilder()
              .setTitle(`${EMOJIS.games} You Won!`)
              .setColor(COLORS.success)
              .setDescription(`You matched all pairs in ${moves} moves!`)
              .setTimestamp();

            await i.update({ embeds: [winEmbed], components: [] });
            collector.stop();
          } else {
            const updateEmbed = new EmbedBuilder()
              .setTitle(`${EMOJIS.games} Memory Game`)
              .setColor(COLORS.success)
              .setDescription(`Match found! Moves: ${moves}\n\n${displayBoard()}`)
              .setTimestamp();

            await i.update({ embeds: [updateEmbed], components: [createButtons()] });
          }
        } else {
          const updateEmbed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} Memory Game`)
            .setColor(COLORS.info)
            .setDescription(`No match! Moves: ${moves}\n\n${displayBoard()}`)
            .setTimestamp();

          await i.update({ embeds: [updateEmbed], components: [createButtons()] });

          setTimeout(() => {
            revealed[firstCard!] = false;
            revealed[index] = false;
            firstCard = null;
            const resetEmbed = new EmbedBuilder()
              .setTitle(`${EMOJIS.games} Memory Game`)
              .setColor(COLORS.info)
              .setDescription(`Match the pairs! Moves: ${moves}\n\n${displayBoard()}`)
              .setTimestamp();

            message.edit({ embeds: [resetEmbed], components: [createButtons()] });
          }, 1000);
        }
      }
    });

    collector.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Time's Up!`)
          .setColor(COLORS.error)
          .setDescription('Game timed out.')
          .setTimestamp();

        await message.edit({ embeds: [timeoutEmbed], components: [] });
      }
    });
  }
}

export default MemoryGameCommand;
