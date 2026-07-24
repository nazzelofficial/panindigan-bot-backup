import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class DogCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'dog',
      description: 'Get a random dog image',
      category: 'fun',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['puppy', 'woof'],
      examples: ['/dog', 'p!dog'],
    };
    super(options);
  }

  private dogFacts = [
    'Dogs have a sense of time and miss you when you\'re gone.',
    'A dog\'s nose print is unique, like a human fingerprint.',
    'Dogs can smell your feelings.',
    'Dogs dream just like humans.',
    'A dog\'s average body temperature is 101.2°F.',
    'Dogs can learn more than 1000 words.',
    'Dogs have three eyelids.',
    'The Basenji is the only breed of dog that can\'t bark.',
    'Dogs can be trained to detect cancer and other diseases.',
    'A Greyhound could beat a Cheetah in a long-distance race.',
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const fact = this.dogFacts[Math.floor(Math.random() * this.dogFacts.length)];
    const dogEmojis = ['🐶', '🐕', '🦮', '🐕‍🦺', '🐩'];
    const emoji = dogEmojis[Math.floor(Math.random() * dogEmojis.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${emoji} Random Dog`)
      .setColor(COLORS.info)
      .setDescription(fact)
      .setImage('https://dog.ceo/api/breeds/image/random')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const fact = this.dogFacts[Math.floor(Math.random() * this.dogFacts.length)];
    const dogEmojis = ['🐶', '🐕', '🦮', '🐕‍🦺', '🐩'];
    const emoji = dogEmojis[Math.floor(Math.random() * dogEmojis.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${emoji} Random Dog`)
      .setColor(COLORS.info)
      .setDescription(fact)
      .setImage('https://dog.ceo/api/breeds/image/random')
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default DogCommand;
