// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import {
  ChatInputCommandInteraction, Message, SlashCommandBuilder,
} from 'discord.js';
import { ErrorHandler } from '../../handlers/ErrorHandler.js';
import { SuccessHandler } from '../../handlers/SuccessHandler.js';
import { EmbedManager } from '../../structures/EmbedManager.js';
import { validationService } from '../../services/ValidationService.js';
import { emojiManager } from '../../utils/EmojiManager.js';

export class FunCommand extends BaseCommand {
  constructor() {
    super({
      name: 'fun',
      description: 'Fun commands for entertainment',
      category: 'fun',
      premiumTier: 'free',
      cooldown: 3,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['entertainment', 'games'],
      examples: ['/fun joke', '/fun meme', '/fun 8ball'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder()
      .setName(this.name).setDescription(this.description)
      
      // Humor Subcommand Group
      .addSubcommandGroup(g => g.setName('humor').setDescription('Humor and jokes')
        .addSubcommand(s => s.setName('joke').setDescription('Get a random joke'))
        .addSubcommand(s => s.setName('dadjoke').setDescription('Get a dad joke'))
        .addSubcommand(s => s.setName('meme').setDescription('Get a random meme'))
        .addSubcommand(s => s.setName('8ball').setDescription('Ask the magic 8-ball')
          .addStringOption(o => o.setName('question').setDescription('Your question').setRequired(true))))
      
      // Animals Subcommand Group
      .addSubcommandGroup(g => g.setName('animals').setDescription('Animal images')
        .addSubcommand(s => s.setName('cat').setDescription('Get a random cat image'))
        .addSubcommand(s => s.setName('dog').setDescription('Get a random dog image'))
        .addSubcommand(s => s.setName('fox').setDescription('Get a random fox image'))
        .addSubcommand(s => s.setName('duck').setDescription('Get a random duck image'))
        .addSubcommand(s => s.setName('panda').setDescription('Get a random panda image'))
        .addSubcommand(s => s.setName('shiba').setDescription('Get a random shiba image'))
        .addSubcommand(s => s.setName('capybara').setDescription('Get a random capybara image')))
      
      // Fortune Subcommand Group
      .addSubcommandGroup(g => g.setName('fortune').setDescription('Fortune and divination')
        .addSubcommand(s => s.setName('8ball').setDescription('Ask the magic 8-ball')
          .addStringOption(o => o.setName('question').setDescription('Your question').setRequired(true)))
        .addSubcommand(s => s.setName('tarot').setDescription('Draw a tarot card'))
        .addSubcommand(s => s.setName('horoscope').setDescription('Get your horoscope')
          .addStringOption(o => o.setName('sign').setDescription('Your zodiac sign').setRequired(true)
            .addChoices([
              { name: 'Aries', value: 'aries' },
              { name: 'Taurus', value: 'taurus' },
              { name: 'Gemini', value: 'gemini' },
              { name: 'Cancer', value: 'cancer' },
              { name: 'Leo', value: 'leo' },
              { name: 'Virgo', value: 'virgo' },
              { name: 'Libra', value: 'libra' },
              { name: 'Scorpio', value: 'scorpio' },
              { name: 'Sagittarius', value: 'sagittarius' },
              { name: 'Capricorn', value: 'capricorn' },
              { name: 'Aquarius', value: 'aquarius' },
              { name: 'Pisces', value: 'pisces' },
            ]))))
      
      // Social Subcommand Group
      .addSubcommandGroup(g => g.setName('social').setDescription('Social interactions')
        .addSubcommand(s => s.setName('ship').setDescription('Ship two users')
          .addUserOption(o => o.setName('user1').setDescription('First user').setRequired(true))
          .addUserOption(o => o.setName('user2').setDescription('Second user').setRequired(true)))
        .addSubcommand(s => s.setName('rate').setDescription('Rate something')
          .addStringOption(o => o.setName('thing').setDescription('Thing to rate').setRequired(true)))
        .addSubcommand(s => s.setName('choose').setDescription('Choose from options')
          .addStringOption(o => o.setName('options').setDescription('Options separated by comma').setRequired(true))))
      
      // Utility Subcommand Group
      .addSubcommandGroup(g => g.setName('utility').setDescription('Fun utilities')
        .addSubcommand(s => s.setName('ascii').setDescription('Convert text to ASCII art')
          .addStringOption(o => o.setName('text').setDescription('Text to convert').setRequired(true)))
        .addSubcommand(s => s.setName('quote').setDescription('Get an inspirational quote'))
        .addSubcommand(s => s.setName('fact').setDescription('Get a random fact'))
        .addSubcommand(s => s.setName('birthday').setDescription('Check birthday compatibility')
          .addUserOption(o => o.setName('user1').setDescription('First user').setRequired(true))
          .addUserOption(o => o.setName('user2').setDescription('Second user').setRequired(false))))
    ) as SlashCommandBuilder;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const subcommandGroup = i.options.getSubcommandGroup();
    const subcommand = i.options.getSubcommand();

    const validation = await validationService.validateInteraction(i, {
      checkBlacklist: true,
    });

    if (!validation.valid) {
      await ErrorHandler.generic(i, new Error(validation.error));
      return;
    }

    if (subcommandGroup === 'humor') {
      switch (subcommand) {
        case 'joke': await this.handleJoke(i); break;
        case 'dadjoke': await this.handleDadJoke(i); break;
        case 'meme': await this.handleMeme(i); break;
        case '8ball': await this.handle8Ball(i); break;
      }
    } else if (subcommandGroup === 'animals') {
      switch (subcommand) {
        case 'cat': await this.handleCat(i); break;
        case 'dog': await this.handleDog(i); break;
        case 'fox': await this.handleFox(i); break;
        case 'duck': await this.handleDuck(i); break;
        case 'panda': await this.handlePanda(i); break;
        case 'shiba': await this.handleShiba(i); break;
        case 'capybara': await this.handleCapybara(i); break;
      }
    } else if (subcommandGroup === 'fortune') {
      switch (subcommand) {
        case '8ball': await this.handle8Ball(i); break;
        case 'tarot': await this.handleTarot(i); break;
        case 'horoscope': await this.handleHoroscope(i); break;
      }
    } else if (subcommandGroup === 'social') {
      switch (subcommand) {
        case 'ship': await this.handleShip(i); break;
        case 'rate': await this.handleRate(i); break;
        case 'choose': await this.handleChoose(i); break;
      }
    } else if (subcommandGroup === 'utility') {
      switch (subcommand) {
        case 'ascii': await this.handleAscii(i); break;
        case 'quote': await this.handleQuote(i); break;
        case 'fact': await this.handleFact(i); break;
        case 'birthday': await this.handleBirthday(i); break;
      }
    }
  }

  // Humor Handlers
  private async handleJoke(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();

    try {
      const jokes = [
        'Why don\'t scientists trust atoms? Because they make up everything!',
        'Why did the scarecrow win an award? Because he was outstanding in his field!',
        'I told my wife she was drawing her eyebrows too high. She looked surprised.',
        'What do you call a fake noodle? An impasta!',
        'Why don\'t eggs tell jokes? They\'d crack each other up!',
      ];

      const jokeIndex = Math.floor(Math.random() * jokes.length);
      const joke = jokes[jokeIndex];

      const embed = EmbedManager.fun('😄 Random Joke', `> ${joke}`, {
        fields: [{ name: '💡 Tip', value: 'Not funny enough? Try `/fun humor dadjoke` for dad-tier humor!', inline: false }],
        timestamp: true,
      });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleDadJoke(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();

    try {
      const dadJokes = [
        'I\'m afraid for the calendar. Its days are numbered.',
        'My wife told me to stop impersonating a flamingo. I had to put my foot down.',
        'I was wondering why the frisbee kept getting bigger and bigger, but then it hit me.',
        'What do you call a bear with no teeth? A gummy bear.',
        'I used to hate facial hair, but then it grew on me.',
      ];

      const joke = dadJokes[Math.floor(Math.random() * dadJokes.length)];

      const embed = EmbedManager.fun('👨 Dad Joke', `> ${joke}\n\n*Ba dum tss! 🥁*`, { timestamp: true });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleMeme(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();

    try {
      // Using a placeholder meme API - in production, use a real meme API
      const embed = EmbedManager.fun('Meme', 'Here\'s a random meme for you!', {
        image: { url: 'https://i.imgur.com/dVa5Xt4.jpg' },
        timestamp: true,
      });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handle8Ball(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const question = i.options.getString('question', true);

    try {
      const responses = [
        'It is certain.',
        'It is decidedly so.',
        'Without a doubt.',
        'Yes, definitely.',
        'You may rely on it.',
        'As I see it, yes.',
        'Most likely.',
        'Outlook good.',
        'Yes.',
        'Signs point to yes.',
        'Reply hazy, try again.',
        'Ask again later.',
        'Better not tell you now.',
        'Cannot predict now.',
        'Concentrate and ask again.',
        'Don\'t count on it.',
        'My reply is no.',
        'My sources say no.',
        'Outlook not so good.',
        'Very doubtful.',
      ];

      const response = responses[Math.floor(Math.random() * responses.length)];
      const positiveResponses = ['It is certain.', 'It is decidedly so.', 'Without a doubt.', 'Yes, definitely.', 'You may rely on it.', 'As I see it, yes.', 'Most likely.', 'Outlook good.', 'Yes.', 'Signs point to yes.'];
      const neutralResponses = ['Reply hazy, try again.', 'Ask again later.', 'Better not tell you now.', 'Cannot predict now.', 'Concentrate and ask again.'];
      const responseEmoji = positiveResponses.includes(response) ? '🟢' : neutralResponses.includes(response) ? '🟡' : '🔴';

      const embed = EmbedManager.fun('🎱 Magic 8-Ball',
        `> ${question}\n\n${responseEmoji} **${response}**`,
        { timestamp: true }
      );
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  // Animal Handlers
  private async handleCat(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();

    try {
      const embed = EmbedManager.fun('Cat', 'Here\'s a cute cat!', {
        image: { url: 'https://cataas.com/cat' },
        timestamp: true,
      });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleDog(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();

    try {
      const embed = EmbedManager.fun('Dog', 'Here\'s a cute dog!', {
        image: { url: 'https://dog.ceo/api/breeds/image/random' },
        timestamp: true,
      });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleFox(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();

    try {
      const embed = EmbedManager.fun('Fox', 'Here\'s a cute fox!', {
        image: { url: 'https://randomfox.ca/floof/' },
        timestamp: true,
      });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleDuck(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();

    try {
      const embed = EmbedManager.fun('Duck', 'Here\'s a cute duck!', {
        image: { url: 'https://random-d.uk/api/random' },
        timestamp: true,
      });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handlePanda(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();

    try {
      const embed = EmbedManager.fun('Panda', 'Here\'s a cute panda!', {
        image: { url: 'https://some-random-api.com/img/panda' },
        timestamp: true,
      });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleShiba(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();

    try {
      const embed = EmbedManager.fun('Shiba', 'Here\'s a cute shiba!', {
        image: { url: 'http://shibe.online/api/shibes?count=1' },
        timestamp: true,
      });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleCapybara(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();

    try {
      const embed = EmbedManager.fun('Capybara', 'Here\'s a cute capybara!', {
        image: { url: 'https://api.capy.lol/v1/capybara?json=true' },
        timestamp: true,
      });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  // Fortune Handlers
  private async handleTarot(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();

    try {
      const cards = [
        { name: 'The Fool', meaning: 'New beginnings, innocence, spontaneity' },
        { name: 'The Magician', meaning: 'Willpower, creation, manifestation' },
        { name: 'The High Priestess', meaning: 'Intuition, mystery, spirituality' },
        { name: 'The Empress', meaning: 'Femininity, beauty, nature' },
        { name: 'The Emperor', meaning: 'Authority, structure, control' },
        { name: 'The Hierophant', meaning: 'Tradition, conformity, morality' },
        { name: 'The Lovers', meaning: 'Love, harmony, relationships' },
        { name: 'The Chariot', meaning: 'Control, willpower, success' },
        { name: 'Strength', meaning: 'Courage, persuasion, influence' },
        { name: 'The Hermit', meaning: 'Soul-searching, introspection, loneliness' },
      ];

      const card = cards[Math.floor(Math.random() * cards.length)];

      const embed = EmbedManager.fun('Tarot Card', `**${card.name}**\n\n${card.meaning}`, { timestamp: true });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleHoroscope(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const sign = i.options.getString('sign', true);

    try {
      const horoscopes: Record<string, string> = {
        aries: 'Today is a great day for new adventures. Take initiative and lead the way!',
        taurus: 'Focus on stability and comfort. Small investments will pay off.',
        gemini: 'Communication is key today. Express yourself clearly.',
        cancer: 'Emotional connections are important. Nurture your relationships.',
        leo: 'Your confidence is shining. Take center stage and show your talents.',
        virgo: 'Attention to detail will bring success. Don\'t overlook the small things.',
        libra: 'Balance is essential. Find harmony in all aspects of your life.',
        scorpio: 'Transformation is in the air. Embrace change and growth.',
        sagittarius: 'Adventure awaits. Explore new ideas and perspectives.',
        capricorn: 'Hard work will be rewarded. Stay focused on your goals.',
        aquarius: 'Innovation is your strength. Think outside the box.',
        pisces: 'Intuition guides you today. Trust your instincts.',
      };

      const horoscope = horoscopes[sign] || 'Horoscope not available.';

      const embed = EmbedManager.fun('Horoscope', `**${sign.charAt(0).toUpperCase() + sign.slice(1)}**\n\n${horoscope}`, { timestamp: true });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  // Social Handlers
  private async handleShip(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const user1 = i.options.getUser('user1', true);
    const user2 = i.options.getUser('user2', true);

    try {
      const compatibility = Math.floor(Math.random() * 100) + 1;
      const shipName = `${user1.username.substring(0, Math.ceil(user1.username.length / 2))}${user2.username.substring(Math.ceil(user2.username.length / 2))}`;

      let message = '';
      if (compatibility >= 80) {
        message = 'Perfect match! 💕';
      } else if (compatibility >= 60) {
        message = 'Great potential! 💖';
      } else if (compatibility >= 40) {
        message = 'Could work out! 💗';
      } else {
        message = 'Maybe not the best match... 💔';
      }

      const embed = EmbedManager.fun('Ship', `**${user1.tag}** + **${user2.tag}** = **${shipName}**\n\nCompatibility: **${compatibility}%**\n${message}`, { timestamp: true });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleRate(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const thing = i.options.getString('thing', true);

    try {
      const rating = (Math.random() * 10).toFixed(1);

      const embed = EmbedManager.fun('Rate', `I rate **${thing}** ${rating}/10`, { timestamp: true });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleChoose(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const options = i.options.getString('options', true);

    try {
      const choices = options.split(',').map(s => s.trim());
      const choice = choices[Math.floor(Math.random() * choices.length)];

      const embed = EmbedManager.fun('Choose', `I choose: **${choice}**`, { timestamp: true });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  // Utility Handlers
  private async handleAscii(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const text = i.options.getString('text', true);

    try {
      // Simplified ASCII art - in production, use a proper ASCII art library
      const ascii = `
  ${text.split('').join('  ')}
  ${text.split('').map(() => '█').join('  ')}
      `;

      const embed = EmbedManager.fun('ASCII Art', `\`\`\`${ascii}\`\`\``, { timestamp: true });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleQuote(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();

    try {
      const quotes = [
        { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
        { text: 'Innovation distinguishes between a leader and a follower.', author: 'Steve Jobs' },
        { text: 'Stay hungry, stay foolish.', author: 'Steve Jobs' },
        { text: 'The future belongs to those who believe in the beauty of their dreams.', author: 'Eleanor Roosevelt' },
        { text: 'It does not matter how slowly you go as long as you do not stop.', author: 'Confucius' },
      ];

      const quote = quotes[Math.floor(Math.random() * quotes.length)];

      const embed = EmbedManager.fun('💬 Inspirational Quote',
        `> *"${quote.text}"*\n\n**— ${quote.author}**`,
        {
          fields: [{ name: '💡 Need more?', value: 'Use `/fun utility fact` for random facts!', inline: false }],
          timestamp: true,
        }
      );
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleFact(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();

    try {
      const facts = [
        'Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old.',
        'The shortest war in history was between Britain and Zanzibar in 1896. Zanzibar surrendered after 38 minutes.',
        'A day on Venus is longer than a year on Venus.',
        'Octopuses have three hearts.',
        'Bananas are berries, but strawberries aren\'t.',
        'The Hawaiian alphabet has only 12 letters.',
        'A group of flamingos is called a "flamboyance".',
        'The Great Wall of China is not visible from space with the naked eye.',
      ];

      const fact = facts[Math.floor(Math.random() * facts.length)];

      const embed = EmbedManager.fun('Random Fact', fact, { timestamp: true });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleBirthday(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const user1 = i.options.getUser('user1', true);
    const user2 = i.options.getUser('user2');

    try {
      const compatibility = Math.floor(Math.random() * 100) + 1;

      const embed = EmbedManager.fun('Birthday Compatibility', `**${user1.tag}**${user2 ? ` + **${user2.tag}**` : ''}\n\nCompatibility: **${compatibility}%**`, { timestamp: true });
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    await m.reply({ content: 'Use slash command /fun for full options.' });
  }
}

export default FunCommand;