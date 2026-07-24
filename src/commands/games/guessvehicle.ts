import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class GuessVehicleCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'guessvehicle',
      description: 'Guess the vehicle from a description',
      category: 'games',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['vehiclequiz'],
      examples: ['/guessvehicle', 'p!guessvehicle'],
    };
    super(options);
  }

  private vehicles = [
    { description: 'I have two wheels and an engine, I need a helmet', vehicle: 'Motorcycle' },
    { description: 'I have four wheels and carry passengers', vehicle: 'Car' },
    { description: 'I am large and carry many people on roads', vehicle: 'Bus' },
    { description: 'I fly in the sky and carry passengers', vehicle: 'Airplane' },
    { description: 'I travel on rails and carry cargo', vehicle: 'Train' },
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const vehicle = this.vehicles[Math.floor(Math.random() * this.vehicles.length)];
    let attempts = 0;
    const maxAttempts = 3;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Guess the Vehicle`)
      .setColor(COLORS.info)
      .setDescription(`Guess the vehicle from this description:\n\n"${vehicle.description}"\n\nYou have ${maxAttempts} attempts.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    const collector = interaction.channel?.createMessageCollector({
      filter: (m) => m.author.id === interaction.user.id,
      time: 60000,
    });

    collector?.on('collect', async (m) => {
      attempts++;

      if (m.content.toLowerCase() === vehicle.vehicle.toLowerCase()) {
        const winEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} You Won!`)
          .setColor(COLORS.success)
          .setDescription(`The vehicle was ${vehicle.vehicle}. You got it in ${attempts} attempts!`)
          .setTimestamp();

        await interaction.editReply({ embeds: [winEmbed] });
        collector.stop();
      } else if (attempts >= maxAttempts) {
        const loseEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Game Over`)
          .setColor(COLORS.error)
          .setDescription(`The vehicle was ${vehicle.vehicle}.`)
          .setTimestamp();

        await interaction.editReply({ embeds: [loseEmbed] });
        collector.stop();
      } else {
        const updateEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} Guess the Vehicle`)
          .setColor(COLORS.info)
          .setDescription(`Wrong! Attempts left: ${maxAttempts - attempts}\n\n"${vehicle.description}"`)
          .setTimestamp();

        await interaction.editReply({ embeds: [updateEmbed] });
      }
    });

    collector?.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Time's Up!`)
          .setColor(COLORS.error)
          .setDescription(`The vehicle was ${vehicle.vehicle}.`)
          .setTimestamp();

        await interaction.editReply({ embeds: [timeoutEmbed] });
      }
    });
  }

  public async executePrefix(message: Message): Promise<void> {
    const vehicle = this.vehicles[Math.floor(Math.random() * this.vehicles.length)];
    let attempts = 0;
    const maxAttempts = 3;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Guess the Vehicle`)
      .setColor(COLORS.info)
      .setDescription(`Guess the vehicle from this description:\n\n"${vehicle.description}"\n\nYou have ${maxAttempts} attempts.`)
      .setTimestamp();

    await message.reply({ embeds: [embed] });

    const collector = message.channel.createMessageCollector({
      filter: (m) => m.author.id === message.author.id,
      time: 60000,
    });

    collector.on('collect', async (m) => {
      attempts++;

      if (m.content.toLowerCase() === vehicle.vehicle.toLowerCase()) {
        const winEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} You Won!`)
          .setColor(COLORS.success)
          .setDescription(`The vehicle was ${vehicle.vehicle}. You got it in ${attempts} attempts!`)
          .setTimestamp();

        await message.edit({ embeds: [winEmbed] });
        collector.stop();
      } else if (attempts >= maxAttempts) {
        const loseEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Game Over`)
          .setColor(COLORS.error)
          .setDescription(`The vehicle was ${vehicle.vehicle}.`)
          .setTimestamp();

        await message.edit({ embeds: [loseEmbed] });
        collector.stop();
      } else {
        const updateEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} Guess the Vehicle`)
          .setColor(COLORS.info)
          .setDescription(`Wrong! Attempts left: ${maxAttempts - attempts}\n\n"${vehicle.description}"`)
          .setTimestamp();

        await message.edit({ embeds: [updateEmbed] });
      }
    });

    collector.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Time's Up!`)
          .setColor(COLORS.error)
          .setDescription(`The vehicle was ${vehicle.vehicle}.`)
          .setTimestamp();

        await message.edit({ embeds: [timeoutEmbed] });
      }
    });
  }
}

export default GuessVehicleCommand;
