// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class CatCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'cat',
      description: 'Get a random cat image',
      category: 'fun',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['kitten', 'meow'],
      examples: ['/cat', 'p!cat'],
    };
    super(options);
  }

  private catFacts = [
    'Cats can rotate their ears 180 degrees.',
    'Cats have over 20 vocalizations, including the meow.',
    'A group of cats is called a clowder.',
    'Cats spend 70% of their lives sleeping.',
    'A cat\'s hearing is better than a dog\'s.',
    'Cats can jump up to 6 times their length.',
    'The first cat in space was a French cat named Félicette.',
    'Cats have five toes on their front paws, but only four on the back.',
    'A cat\'s nose print is unique, like a human fingerprint.',
    'Cats can\'t taste sweetness.',
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const fact = this.catFacts[Math.floor(Math.random() * this.catFacts.length)];
    const catEmojis = ['🐱', '🐈', '😺', '😸', '😻'];
    const emoji = catEmojis[Math.floor(Math.random() * catEmojis.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${emoji} Random Cat`)
      .setColor(COLORS.info)
      .setDescription(fact)
      .setImage('https://cataas.com/cat')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const fact = this.catFacts[Math.floor(Math.random() * this.catFacts.length)];
    const catEmojis = ['🐱', '🐈', '😺', '😸', '😻'];
    const emoji = catEmojis[Math.floor(Math.random() * catEmojis.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${emoji} Random Cat`)
      .setColor(COLORS.info)
      .setDescription(fact)
      .setImage('https://cataas.com/cat')
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default CatCommand;
