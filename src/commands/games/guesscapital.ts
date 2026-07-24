import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, ComponentType, ButtonStyle, ActionRowBuilder, ButtonBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class GuessCapitalCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'guesscapital',
      description: 'Guess the capital of a country',
      category: 'games',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['capitalquiz', 'countrycapital'],
      examples: ['/guesscapital', 'p!guesscapital'],
    };
    super(options);
  }

  private countries = [
    { country: 'Japan', capital: 'Tokyo' },
    { country: 'France', capital: 'Paris' },
    { country: 'Germany', capital: 'Berlin' },
    { country: 'Italy', capital: 'Rome' },
    { country: 'Spain', capital: 'Madrid' },
    { country: 'United Kingdom', capital: 'London' },
    { country: 'Canada', capital: 'Ottawa' },
    { country: 'Australia', capital: 'Canberra' },
    { country: 'Brazil', capital: 'Brasilia' },
    { country: 'India', capital: 'New Delhi' },
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const country = this.countries[Math.floor(Math.random() * this.countries.length)];
    const wrongOptions = this.countries
      .filter((c) => c.country !== country.country)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    const options = [country, ...wrongOptions].sort(() => Math.random() - 0.5);

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        options.map((option) =>
          new ButtonBuilder()
            .setCustomId(`capital_${option.capital}`)
            .setLabel(option.capital)
            .setStyle(ButtonStyle.Primary)
        )
      );

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Guess the Capital`)
      .setColor(COLORS.info)
      .setDescription(`What is the capital of ${country.country}?`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed], components: [row] });

    const collector = interaction.channel?.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 30000,
    });

    collector?.on('collect', async (i) => {
      const selectedCapital = i.customId.split('_')[1];

      if (selectedCapital === country.capital) {
        const winEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} Correct!`)
          .setColor(COLORS.success)
          .setDescription(`The capital of ${country.country} is ${country.capital}!`)
          .setTimestamp();

        await i.update({ embeds: [winEmbed], components: [] });
        collector.stop();
      } else {
        const loseEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Wrong!`)
          .setColor(COLORS.error)
          .setDescription(`The capital of ${country.country} is ${country.capital}!`)
          .setTimestamp();

        await i.update({ embeds: [loseEmbed], components: [] });
        collector.stop();
      }
    });

    collector?.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Time's Up!`)
          .setColor(COLORS.error)
          .setDescription(`The capital of ${country.country} is ${country.capital}!`)
          .setTimestamp();

        await interaction.editReply({ embeds: [timeoutEmbed], components: [] });
      }
    });
  }

  public async executePrefix(message: Message): Promise<void> {
    const country = this.countries[Math.floor(Math.random() * this.countries.length)];
    const wrongOptions = this.countries
      .filter((c) => c.country !== country.country)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    const options = [country, ...wrongOptions].sort(() => Math.random() - 0.5);

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        options.map((option) =>
          new ButtonBuilder()
            .setCustomId(`capital_${option.capital}`)
            .setLabel(option.capital)
            .setStyle(ButtonStyle.Primary)
        )
      );

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Guess the Capital`)
      .setColor(COLORS.info)
      .setDescription(`What is the capital of ${country.country}?`)
      .setTimestamp();

    await message.reply({ embeds: [embed], components: [row] });

    const collector = message.channel.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 30000,
    });

    collector.on('collect', async (i) => {
      const selectedCapital = i.customId.split('_')[1];

      if (selectedCapital === country.capital) {
        const winEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} Correct!`)
          .setColor(COLORS.success)
          .setDescription(`The capital of ${country.country} is ${country.capital}!`)
          .setTimestamp();

        await i.update({ embeds: [winEmbed], components: [] });
        collector.stop();
      } else {
        const loseEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Wrong!`)
          .setColor(COLORS.error)
          .setDescription(`The capital of ${country.country} is ${country.capital}!`)
          .setTimestamp();

        await i.update({ embeds: [loseEmbed], components: [] });
        collector.stop();
      }
    });

    collector.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Time's Up!`)
          .setColor(COLORS.error)
          .setDescription(`The capital of ${country.country} is ${country.capital}!`)
          .setTimestamp();

        await message.edit({ embeds: [timeoutEmbed], components: [] });
      }
    });
  }
}

export default GuessCapitalCommand;
