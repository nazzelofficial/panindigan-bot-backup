import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, ComponentType, ButtonStyle, ActionRowBuilder, ButtonBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class SlotMachineCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'slotmachine',
      description: 'Play a slot machine game',
      category: 'games',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['slots', 'slot'],
      examples: ['/slotmachine', 'p!slotmachine'],
    };
    super(options);
  }

  private symbols = ['🍒', '🍋', '🍊', '🍇', '💎', '7️⃣'];
  private credits = 100;

  private spin(): string[] {
    return [
      this.symbols[Math.floor(Math.random() * this.symbols.length)],
      this.symbols[Math.floor(Math.random() * this.symbols.length)],
      this.symbols[Math.floor(Math.random() * this.symbols.length)],
    ];
  }

  private calculateWinnings(result: string[]): number {
    if (result[0] === result[1] && result[1] === result[2]) {
      if (result[0] === '7️⃣') return 50;
      if (result[0] === '💎') return 20;
      return 10;
    }
    if (result[0] === result[1] || result[1] === result[2] || result[0] === result[2]) {
      return 2;
    }
    return 0;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    this.credits = 100;

    const createButtons = () => {
      const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder().setCustomId('slot_spin').setLabel('Spin (10 credits)').setStyle(ButtonStyle.Primary)
        );
      return [row];
    };

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Slot Machine`)
      .setColor(COLORS.info)
      .setDescription(`Credits: ${this.credits}\n\n🍒 🍋 🍊\n\nSpin to win!`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed], components: createButtons() });

    const collector = interaction.channel?.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 300000,
    });

    collector?.on('collect', async (i) => {
      if (this.credits < 10) {
        const noCreditsEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} No Credits`)
          .setColor(COLORS.error)
          .setDescription('You don\'t have enough credits to spin!')
          .setTimestamp();

        await i.update({ embeds: [noCreditsEmbed], components: [] });
        collector.stop();
        return;
      }

      this.credits -= 10;
      const result = this.spin();
      const winnings = this.calculateWinnings(result);
      this.credits += winnings;

      const resultEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.games} Slot Machine`)
        .setColor(winnings > 0 ? COLORS.success : COLORS.info)
        .setDescription(`Credits: ${this.credits}\n\n${result.join(' ')}\n\n${winnings > 0 ? `You won ${winnings} credits!` : 'No luck this time!'}`)
        .setTimestamp();

      if (this.credits <= 0) {
        await i.update({ embeds: [resultEmbed], components: [] });
        collector.stop();
      } else {
        await i.update({ embeds: [resultEmbed], components: createButtons() });
      }
    });

    collector?.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Game Ended`)
          .setColor(COLORS.error)
          .setDescription(`Final Credits: ${this.credits}`)
          .setTimestamp();

        await interaction.editReply({ embeds: [timeoutEmbed], components: [] });
      }
    });
  }

  public async executePrefix(message: Message): Promise<void> {
    this.credits = 100;

    const createButtons = () => {
      const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder().setCustomId('slot_spin').setLabel('Spin (10 credits)').setStyle(ButtonStyle.Primary)
        );
      return [row];
    };

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Slot Machine`)
      .setColor(COLORS.info)
      .setDescription(`Credits: ${this.credits}\n\n🍒 🍋 🍊\n\nSpin to win!`)
      .setTimestamp();

    await message.reply({ embeds: [embed], components: createButtons() });

    const collector = message.channel.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 300000,
    });

    collector.on('collect', async (i) => {
      if (this.credits < 10) {
        const noCreditsEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} No Credits`)
          .setColor(COLORS.error)
          .setDescription('You don\'t have enough credits to spin!')
          .setTimestamp();

        await i.update({ embeds: [noCreditsEmbed], components: [] });
        collector.stop();
        return;
      }

      this.credits -= 10;
      const result = this.spin();
      const winnings = this.calculateWinnings(result);
      this.credits += winnings;

      const resultEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.games} Slot Machine`)
        .setColor(winnings > 0 ? COLORS.success : COLORS.info)
        .setDescription(`Credits: ${this.credits}\n\n${result.join(' ')}\n\n${winnings > 0 ? `You won ${winnings} credits!` : 'No luck this time!'}`)
        .setTimestamp();

      if (this.credits <= 0) {
        await i.update({ embeds: [resultEmbed], components: [] });
        collector.stop();
      } else {
        await i.update({ embeds: [resultEmbed], components: createButtons() });
      }
    });

    collector.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Game Ended`)
          .setColor(COLORS.error)
          .setDescription(`Final Credits: ${this.credits}`)
          .setTimestamp();

        await message.edit({ embeds: [timeoutEmbed], components: [] });
      }
    });
  }
}

export default SlotMachineCommand;
