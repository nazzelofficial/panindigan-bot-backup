import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class PandaCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'panda',
      description: 'Get a random panda fact and image',
      category: 'fun',
      premiumTier: 'bronze',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      ownerOnly: false,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['pandafact'],
      examples: ['/panda', 'p!panda'],
    };
    super(options);
  }

  private pandaFacts = [
    'Giant pandas spend 10–16 hours a day eating bamboo.',
    'A newborn panda is about the size of a stick of butter.',
    'Pandas have a special "pseudo-thumb" — an enlarged wrist bone — to help them grip bamboo.',
    'Giant pandas are solitary animals and have a keen sense of smell.',
    'Despite being carnivores, 99% of a panda\'s diet consists of bamboo.',
    'Giant pandas can swim and are excellent tree climbers.',
    'A panda can eat 26–84 pounds of bamboo in a single day.',
    'Pandas can live up to 20 years in the wild and 30 in captivity.',
    'Baby pandas are born pink and don\'t get their black and white markings until several weeks later.',
    'The panda\'s distinctive markings may help with camouflage in snowy and shadowy environments.',
    'Giant pandas are native to central China, in mountain forests.',
    'There are fewer than 2,000 giant pandas left in the wild.',
    'Pandas produce a waxy scent marking from glands under their tails.',
    'A panda\'s digestive system is more like a carnivore\'s, making bamboo digestion quite inefficient.',
    'The red panda, despite its name, is not closely related to the giant panda.',
  ];

  private pandaImages = [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Grosser_Panda.JPG/1200px-Grosser_Panda.JPG',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Ailuropoda_melanoleuca_-_San_Diego_Zoo-8.jpg/1024px-Ailuropoda_melanoleuca_-_San_Diego_Zoo-8.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Giant_Panda_2004-03-2.jpg/1024px-Giant_Panda_2004-03-2.jpg',
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const fact = this.pandaFacts[Math.floor(Math.random() * this.pandaFacts.length)];
    const image = this.pandaImages[Math.floor(Math.random() * this.pandaImages.length)];

    const embed = new EmbedBuilder()
      .setTitle('🐼 Random Panda')
      .setDescription(`**Did you know?**\n${fact}`)
      .setColor(0x333333)
      .setImage(image)
      .setFooter({ text: 'Pandas are amazing! 🐼' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const fact = this.pandaFacts[Math.floor(Math.random() * this.pandaFacts.length)];
    const image = this.pandaImages[Math.floor(Math.random() * this.pandaImages.length)];

    const embed = new EmbedBuilder()
      .setTitle('🐼 Random Panda')
      .setDescription(`**Did you know?**\n${fact}`)
      .setColor(0x333333)
      .setImage(image)
      .setFooter({ text: 'Pandas are amazing! 🐼' })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default PandaCommand;
