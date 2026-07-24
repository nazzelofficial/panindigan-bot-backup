import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class FactCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'fact',
      description: 'Get a random fun fact',
      category: 'fun',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['funfact', 'randomfact'],
      examples: ['/fact', 'p!fact'],
    };
    super(options);
  }

  private facts = [
    'Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly edible.',
    'The shortest war in history lasted 38 minutes between Britain and Zanzibar in 1896.',
    'A day on Venus is longer than a year on Venus.',
    'Octopuses have three hearts and blue blood.',
    'The Eiffel Tower can be 15 cm taller during the summer due to thermal expansion.',
    'Bananas are berries, but strawberries aren\'t.',
    'A group of flamingos is called a "flamboyance".',
    'The human brain weighs about 3 pounds but uses 20% of the body\'s energy.',
    'Cows have best friends and get stressed when separated.',
    'The first alarm clock could only ring at 4 AM.',
    'A cloud can weigh more than a million pounds.',
    'The Hawaiian alphabet has only 12 letters.',
    'A jellyfish is 95% water.',
    'The Great Wall of China is not visible from space with the naked eye.',
    'A shrimp\'s heart is in its head.',
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const fact = this.facts[Math.floor(Math.random() * this.facts.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} Random Fact`)
      .setColor(COLORS.info)
      .setDescription(fact)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const fact = this.facts[Math.floor(Math.random() * this.facts.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} Random Fact`)
      .setColor(COLORS.info)
      .setDescription(fact)
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default FactCommand;
