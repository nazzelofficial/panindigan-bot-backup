// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';

const GIFTS: Record<string, { emoji: string; description: string }> = {
  roses: {
    emoji: '🌹',
    description: 'A gorgeous bouquet of red roses, symbolizing deep love and passion.',
  },
  chocolates: {
    emoji: '🍫',
    description: 'A luxurious box of handcrafted chocolates, as sweet as your love.',
  },
  'teddy bear': {
    emoji: '🧸',
    description: 'A big fluffy teddy bear to cuddle whenever you miss them.',
  },
  ring: {
    emoji: '💍',
    description: 'A sparkling diamond ring — a timeless symbol of eternal commitment.',
  },
  stars: {
    emoji: '⭐',
    description: 'A jar filled with 365 paper stars — one reason to love them for every day of the year.',
  },
};

export class ValentineGiftCommand extends BaseCommand {
  constructor() {
    super({
      name: 'valentinegift',
      description: 'Send a virtual gift to your loved one 🎁',
      category: 'social',
      premiumTier: 'free',
      cooldown: 5,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['gift', 'vgift', 'sendgift'],
      examples: ['/valentinegift @user roses', '/valentinegift @user ring'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addUserOption(o =>
        o.setName('user').setDescription('Who to send the gift to').setRequired(true)
      )
      .addStringOption(o =>
        o.setName('gift')
          .setDescription('Choose a gift to send')
          .setRequired(true)
          .addChoices(
            { name: '🌹 Roses', value: 'roses' },
            { name: '🍫 Chocolates', value: 'chocolates' },
            { name: '🧸 Teddy Bear', value: 'teddy bear' },
            { name: '💍 Ring', value: 'ring' },
            { name: '⭐ Stars', value: 'stars' }
          )
      )
      .setDMPermission(true)) as SlashCommandBuilder;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    try {
      const target = i.options.getUser('user', true);
      const giftKey = i.options.getString('gift', true);
      const gift = GIFTS[giftKey];

      if (!gift) {
        await i.reply({ content: '❌ Invalid gift choice!', ephemeral: true });
        return;
      }

      if (target.id === i.user.id) {
        await i.reply({ content: '❌ You cannot gift yourself! Share the love with someone else 💕', ephemeral: true });
        return;
      }

      if (target.bot) {
        await i.reply({ content: '❌ Bots cannot receive gifts... but that\'s very sweet of you! 🤖', ephemeral: true });
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle(`${gift.emoji} A Valentine's Gift!`)
        .setDescription(
          `${i.user.toString()} sends ${target.toString()} a gift! 🎁\n\n` +
          `**${gift.emoji} ${giftKey.charAt(0).toUpperCase() + giftKey.slice(1)}**\n` +
          `*${gift.description}*\n\n` +
          `💌 *With love and warm wishes, from the heart* 💖`
        )
        .setColor(COLORS.default)
        .setThumbnail(target.displayAvatarURL())
        .setFooter({ text: "A virtual gift, but the love is very real! 💕" })
        .setTimestamp();

      await i.reply({ embeds: [embed] });
    } catch (err) {
      console.error('[ValentineGiftCommand] Error:', err);
      await i.reply({ content: '❌ Could not send the gift. Please try again.', ephemeral: true });
    }
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    try {
      const target = m.mentions.users.first();
      if (!target) {
        await m.reply('❌ Please mention a user! Example: `valentinegift @user roses`');
        return;
      }

      if (target.id === m.author.id) {
        await m.reply('❌ You cannot gift yourself! Share the love with someone else 💕');
        return;
      }

      if (target.bot) {
        await m.reply('❌ Bots cannot receive gifts... but that\'s very sweet of you! 🤖');
        return;
      }

      const giftKey = args[1]?.toLowerCase();
      const gift = giftKey ? GIFTS[giftKey] : undefined;

      if (!gift) {
        const choices = Object.keys(GIFTS).join(', ');
        await m.reply(`❌ Invalid gift! Choose from: ${choices}\nExample: \`valentinegift @user roses\``);
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle(`${gift.emoji} A Valentine's Gift!`)
        .setDescription(
          `${m.author.toString()} sends ${target.toString()} a gift! 🎁\n\n` +
          `**${gift.emoji} ${giftKey.charAt(0).toUpperCase() + giftKey.slice(1)}**\n` +
          `*${gift.description}*\n\n` +
          `💌 *With love and warm wishes, from the heart* 💖`
        )
        .setColor(COLORS.default)
        .setThumbnail(target.displayAvatarURL())
        .setFooter({ text: "A virtual gift, but the love is very real! 💕" })
        .setTimestamp();

      await m.reply({ embeds: [embed] });
    } catch (err) {
      console.error('[ValentineGiftCommand] Error:', err);
      await m.reply('❌ Could not send the gift. Please try again.');
    }
  }
}

export default ValentineGiftCommand;
