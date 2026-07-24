import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class QuoteCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'quote',
      description: 'Get an inspirational quote',
      category: 'fun',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['inspire', 'motivation'],
      examples: ['/quote', 'p!quote'],
    };
    super(options);
  }

  private quotes = [
    { quote: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
    { quote: 'Innovation distinguishes between a leader and a follower.', author: 'Steve Jobs' },
    { quote: 'Stay hungry, stay foolish.', author: 'Steve Jobs' },
    { quote: 'The future belongs to those who believe in the beauty of their dreams.', author: 'Eleanor Roosevelt' },
    { quote: 'It is during our darkest moments that we must focus to see the light.', author: 'Aristotle' },
    { quote: 'The only thing we have to fear is fear itself.', author: 'Franklin D. Roosevelt' },
    { quote: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill' },
    { quote: 'The best way to predict the future is to create it.', author: 'Peter Drucker' },
    { quote: 'Be the change you wish to see in the world.', author: 'Mahatma Gandhi' },
    { quote: 'In the middle of difficulty lies opportunity.', author: 'Albert Einstein' },
    { quote: 'Believe you can and you\'re halfway there.', author: 'Theodore Roosevelt' },
    { quote: 'The mind is everything. What you think you become.', author: 'Buddha' },
    { quote: 'Strive not to be a success, but rather to be of value.', author: 'Albert Einstein' },
    { quote: 'Two roads diverged in a wood, and I took the one less traveled by.', author: 'Robert Frost' },
    { quote: 'Do what you can, with what you have, where you are.', author: 'Theodore Roosevelt' },
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const quote = this.quotes[Math.floor(Math.random() * this.quotes.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} Inspirational Quote`)
      .setColor(COLORS.info)
      .setDescription(`"${quote.quote}"`)
      .addFields([
        { name: 'Author', value: quote.author, inline: true },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const quote = this.quotes[Math.floor(Math.random() * this.quotes.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} Inspirational Quote`)
      .setColor(COLORS.info)
      .setDescription(`"${quote.quote}"`)
      .addFields([
        { name: 'Author', value: quote.author, inline: true },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default QuoteCommand;
