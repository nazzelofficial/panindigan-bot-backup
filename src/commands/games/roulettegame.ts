import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, ComponentType, ButtonStyle, ActionRowBuilder, ButtonBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class RouletteGameCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'roulettegame',
      description: 'Play Russian roulette',
      category: 'games',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['russianroulette', 'rr'],
      examples: ['/roulettegame', 'p!roulettegame'],
    };
    super(options);
  }

  private chamber = 0;
  private bulletChamber = 0;
  private gameOver = false;

  private initializeGame(): void {
    this.chamber = Math.floor(Math.random() * 6);
    this.bulletChamber = Math.floor(Math.random() * 6);
    this.gameOver = false;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    this.initializeGame();

    const createButtons = () => {
      const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder().setCustomId('rr_pull').setLabel('Pull Trigger').setStyle(ButtonStyle.Danger)
        );
      return [row];
    };

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Russian Roulette`)
      .setColor(COLORS.info)
      .setDescription('🔫 6 chambers, 1 bullet. Pull the trigger if you dare!')
      .setTimestamp();

    await interaction.reply({ embeds: [embed], components: createButtons() });

    const collector = interaction.channel?.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60000,
    });

    collector?.on('collect', async (i) => {
      this.chamber = (this.chamber + 1) % 6;

      if (this.chamber === this.bulletChamber) {
        this.gameOver = true;
        const loseEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} BANG! 💥`)
          .setColor(COLORS.error)
          .setDescription('You pulled the trigger and... BANG! You lost!')
          .setTimestamp();

        await i.update({ embeds: [loseEmbed], components: [] });
        collector.stop();
      } else {
        const updateEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} Click!`)
          .setColor(COLORS.success)
          .setDescription('Click... You survived! Pull again?')
          .setTimestamp();

        await i.update({ embeds: [updateEmbed], components: createButtons() });
      }
    });

    collector?.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Game Ended`)
          .setColor(COLORS.error)
          .setDescription('You chickened out!')
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
          new ButtonBuilder().setCustomId('rr_pull').setLabel('Pull Trigger').setStyle(ButtonStyle.Danger)
        );
      return [row];
    };

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Russian Roulette`)
      .setColor(COLORS.info)
      .setDescription('🔫 6 chambers, 1 bullet. Pull the trigger if you dare!')
      .setTimestamp();

    await message.reply({ embeds: [embed], components: createButtons() });

    const collector = message.channel.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60000,
    });

    collector.on('collect', async (i) => {
      this.chamber = (this.chamber + 1) % 6;

      if (this.chamber === this.bulletChamber) {
        this.gameOver = true;
        const loseEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} BANG! 💥`)
          .setColor(COLORS.error)
          .setDescription('You pulled the trigger and... BANG! You lost!')
          .setTimestamp();

        await i.update({ embeds: [loseEmbed], components: [] });
        collector.stop();
      } else {
        const updateEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} Click!`)
          .setColor(COLORS.success)
          .setDescription('Click... You survived! Pull again?')
          .setTimestamp();

        await i.update({ embeds: [updateEmbed], components: createButtons() });
      }
    });

    collector.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Game Ended`)
          .setColor(COLORS.error)
          .setDescription('You chickened out!')
          .setTimestamp();

        await message.edit({ embeds: [timeoutEmbed], components: [] });
      }
    });
  }
}

export default RouletteGameCommand;
