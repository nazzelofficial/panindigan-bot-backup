import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class CapybaraCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'capybara',
      description: 'Get a random capybara fact',
      category: 'fun',
      premiumTier: 'bronze',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      ownerOnly: false,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['capy', 'capybara'],
      examples: ['/capybara', 'p!capybara'],
    };
    super(options);
  }

  private facts = [
    'Capybaras are the world\'s largest rodents, weighing up to 150 pounds!',
    'Capybaras are semi-aquatic and spend a lot of time in water.',
    'They can hold their breath underwater for up to 5 minutes.',
    'Capybaras are highly social animals and live in groups of 10–20.',
    'They communicate using sounds like barks, whistles, clicks, and grunts.',
    'Capybaras are native to South America.',
    'Their teeth never stop growing — they wear them down by eating grass.',
    'Capybaras are known to be extremely calm and get along with almost any animal.',
    'They are excellent swimmers and can run as fast as 35 km/h on land.',
    'Baby capybaras can walk and swim shortly after birth.',
    'Capybaras are herbivores, mainly eating grasses and aquatic plants.',
    'Capybaras have been called "nature\'s chairs" because other animals rest on them.',
    'In Japan, capybaras are popular in zoos and are associated with relaxation.',
    'Capybaras use scent glands on their snouts to mark territory.',
    'They have webbed feet to help them swim more efficiently.',
  ];

  private images = [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Capybara_%28Hydrochoerus_hydrochaeris%29.JPG/1280px-Capybara_%28Hydrochoerus_hydrochaeris%29.JPG',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Capybara_8_seconds.jpg/1280px-Capybara_8_seconds.jpg',
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const fact = this.facts[Math.floor(Math.random() * this.facts.length)];
    const image = this.images[Math.floor(Math.random() * this.images.length)];

    const embed = new EmbedBuilder()
      .setTitle('🦫 Random Capybara')
      .setDescription(`**Did you know?**\n${fact}`)
      .setColor(0xa0785a)
      .setImage(image)
      .setFooter({ text: 'Capybaras are living in harmony 🦫' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const fact = this.facts[Math.floor(Math.random() * this.facts.length)];
    const image = this.images[Math.floor(Math.random() * this.images.length)];

    const embed = new EmbedBuilder()
      .setTitle('🦫 Random Capybara')
      .setDescription(`**Did you know?**\n${fact}`)
      .setColor(0xa0785a)
      .setImage(image)
      .setFooter({ text: 'Capybaras are living in harmony 🦫' })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default CapybaraCommand;
