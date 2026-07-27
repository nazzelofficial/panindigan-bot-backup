// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class HoroscopeCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'horoscope',
      description: 'Get your daily horoscope reading',
      category: 'fun',
      premiumTier: 'bronze',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      ownerOnly: false,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['zodiac', 'stars'],
      examples: ['/horoscope sign:aries', 'p!horoscope aries'],
    };
    super(options);
  }

  private signs: Record<string, { emoji: string; dates: string; readings: string[] }> = {
    aries: {
      emoji: '♈',
      dates: 'March 21 – April 19',
      readings: [
        'Today brings bold new opportunities. Trust your instincts and take the lead!',
        'Your passion is at an all-time high. Channel that energy into creative pursuits.',
        'A challenge arises, but your natural courage will carry you through.',
        'Someone admires your confidence today. Don\'t be afraid to shine!',
        'Financial decisions made today could pay off later. Think before you leap.',
      ],
    },
    taurus: {
      emoji: '♉',
      dates: 'April 20 – May 20',
      readings: [
        'Stability and comfort are your themes today. Indulge in life\'s small pleasures.',
        'A stubborn situation finally begins to shift in your favor.',
        'Your reliable nature earns praise from those around you.',
        'Take time for self-care today — you deserve it more than you know.',
        'A financial opportunity presents itself. Proceed with your trademark patience.',
      ],
    },
    gemini: {
      emoji: '♊',
      dates: 'May 21 – June 20',
      readings: [
        'Your social energy is magnetic today. Conversations could lead to exciting possibilities.',
        'Curiosity leads you to an unexpected discovery. Follow that thread!',
        'Balancing two priorities is your challenge today — you\'re up to it.',
        'An old friend reconnects. The timing couldn\'t be better.',
        'Your wit and charm open a door you thought was closed.',
      ],
    },
    cancer: {
      emoji: '♋',
      dates: 'June 21 – July 22',
      readings: [
        'Your intuition is razor-sharp today. Trust what you feel.',
        'Home and family matters come into focus — nurture those connections.',
        'A creative project flourishes when you pour your heart into it.',
        'Emotional clarity arrives after a period of uncertainty.',
        'Your compassion for others brings unexpected rewards today.',
      ],
    },
    leo: {
      emoji: '♌',
      dates: 'July 23 – August 22',
      readings: [
        'The spotlight is yours today — own it with grace and warmth.',
        'A leadership opportunity emerges. Step up with confidence.',
        'Your generosity inspires those around you to give more.',
        'Creative ambitions align with practical opportunities. Strike now!',
        'Recognition for past efforts finally arrives. Celebrate it!',
      ],
    },
    virgo: {
      emoji: '♍',
      dates: 'August 23 – September 22',
      readings: [
        'Your attention to detail saves the day in a complex situation.',
        'Health and wellness take center stage — listen to your body.',
        'An analytical approach to a problem brings breakthrough results.',
        'Organization brings peace of mind. Tackle that to-do list.',
        'A colleague or friend values your practical wisdom more than you realize.',
      ],
    },
    libra: {
      emoji: '♎',
      dates: 'September 23 – October 22',
      readings: [
        'Balance is key today — weigh your options carefully before deciding.',
        'Beauty and harmony fill your surroundings. Let it inspire you.',
        'A relationship reaches a new level of understanding and trust.',
        'Your diplomacy resolves a conflict that\'s been brewing for weeks.',
        'Artistic or aesthetic pursuits bring deep satisfaction today.',
      ],
    },
    scorpio: {
      emoji: '♏',
      dates: 'October 23 – November 21',
      readings: [
        'Deep transformation is underway. Embrace the change, not the fear.',
        'Your perceptiveness reveals a truth others have missed entirely.',
        'Intensity in relationships leads to profound connection.',
        'Trust your gut — a secret is about to come to light.',
        'Power dynamics shift in your favor. Use your influence wisely.',
      ],
    },
    sagittarius: {
      emoji: '♐',
      dates: 'November 22 – December 21',
      readings: [
        'Adventure calls! Even a small step toward the unknown expands your horizons.',
        'Your optimism is contagious — share it freely with those around you.',
        'Philosophy and learning open your mind to new perspectives today.',
        'Travel, even in the mind, brings fresh inspiration and ideas.',
        'Your honesty, while blunt, is exactly what someone needs to hear.',
      ],
    },
    capricorn: {
      emoji: '♑',
      dates: 'December 22 – January 19',
      readings: [
        'Hard work is paying off — keep your eyes on the long-term goal.',
        'Ambition fuels a productive day. You\'re closer to the summit than you think.',
        'Discipline and structure are your superpowers today.',
        'A mentor figure offers valuable guidance. Listen carefully.',
        'Career matters align favorably. Make that bold professional move.',
      ],
    },
    aquarius: {
      emoji: '♒',
      dates: 'January 20 – February 18',
      readings: [
        'Innovation is in the air — your unconventional ideas are ahead of their time.',
        'Community and collaboration bring greater rewards than solo efforts today.',
        'Your humanitarian spirit inspires meaningful change around you.',
        'Technology or science offers a fascinating new lens today.',
        'Friendship deepens when you share your authentic, quirky self.',
      ],
    },
    pisces: {
      emoji: '♓',
      dates: 'February 19 – March 20',
      readings: [
        'Dreams and reality blur beautifully today — pay attention to signs.',
        'Your empathy is a gift. Someone near you truly needs your kindness.',
        'Creative and spiritual energies peak — make art, meditate, imagine.',
        'Letting go of something old makes room for something magical.',
        'Intuition guides you to exactly the right place at the right time.',
      ],
    },
  };

  private buildEmbed(sign: string): EmbedBuilder | null {
    const signData = this.signs[sign.toLowerCase()];
    if (!signData) return null;

    const reading = signData.readings[Math.floor(Math.random() * signData.readings.length)];
    const luckyNumbers = Array.from({ length: 3 }, () => Math.floor(Math.random() * 99) + 1).join(', ');
    const moods = ['Energetic', 'Reflective', 'Optimistic', 'Cautious', 'Passionate', 'Calm', 'Creative', 'Bold'];
    const mood = moods[Math.floor(Math.random() * moods.length)];

    return new EmbedBuilder()
      .setTitle(`${signData.emoji} ${sign.charAt(0).toUpperCase() + sign.slice(1)} — Daily Horoscope`)
      .setDescription(`*${signData.dates}*\n\n${reading}`)
      .addFields(
        { name: '🍀 Lucky Numbers', value: luckyNumbers, inline: true },
        { name: '💫 Today\'s Mood', value: mood, inline: true }
      )
      .setColor(COLORS.default)
      .setFooter({ text: 'For entertainment purposes only ✨' })
      .setTimestamp();
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const sign = interaction.options.getString('sign', true).toLowerCase();
    const embed = this.buildEmbed(sign);

    if (!embed) {
      const validSigns = Object.keys(this.signs).join(', ');
      const errEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Invalid Sign`)
        .setDescription(`Please provide a valid zodiac sign!\n**Valid signs:** ${validSigns}`)
        .setColor(COLORS.error);
      await interaction.reply({ embeds: [errEmbed], ephemeral: true });
      return;
    }

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    if (!args.length) {
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Missing Sign`)
        .setDescription(`Please provide a zodiac sign!\nUsage: \`p!horoscope <sign>\`\n**Signs:** ${Object.keys(this.signs).join(', ')}`)
        .setColor(COLORS.error);
      await message.reply({ embeds: [embed] });
      return;
    }

    const sign = args[0].toLowerCase();
    const embed = this.buildEmbed(sign);

    if (!embed) {
      const validSigns = Object.keys(this.signs).join(', ');
      const errEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Invalid Sign`)
        .setDescription(`Please provide a valid zodiac sign!\n**Valid signs:** ${validSigns}`)
        .setColor(COLORS.error);
      await message.reply({ embeds: [errEmbed] });
      return;
    }

    await message.reply({ embeds: [embed] });
  }
}

export default HoroscopeCommand;
