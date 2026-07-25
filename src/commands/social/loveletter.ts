import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';

const LETTER_OPENINGS: string[] = [
  'Every moment with you feels like a beautiful dream I never want to wake from.',
  'You are the reason I smile even on the darkest of days.',
  'From the moment we met, my heart knew it had found its home.',
  'In a world full of chaos, you are my peace and my joy.',
  'Time seems to stand still whenever I am with you.',
];

const LETTER_MIDDLES: string[] = [
  'Your laughter is my favorite sound, and your smile is my favorite sight.',
  'I cherish every little memory we have made together.',
  'You make every ordinary day feel extraordinary just by being in it.',
  'The way you care for others is one of the countless things I adore about you.',
  'Being with you feels like the most natural thing in the world.',
];

const LETTER_CLOSINGS: string[] = [
  'I am so grateful to have you in my life. Forever yours 💖',
  'You mean more to me than words could ever express. Always and forever 💕',
  'My heart belongs to you, today and always 🌹',
  'Thank you for being you, and for letting me love you 💌',
  'Here\'s to us and all the beautiful moments still to come 🌟',
];

export class LoveLetterCommand extends BaseCommand {
  constructor() {
    super({
      name: 'loveletter',
      description: 'Send a romantic love letter to your partner 💌',
      category: 'social',
      premiumTier: 'free',
      cooldown: 10,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['letter', 'lovemsg'],
      examples: ['/loveletter @user', '/loveletter @user You mean the world to me'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addUserOption(o =>
        o.setName('user').setDescription('Who to send the love letter to').setRequired(true)
      )
      .addStringOption(o =>
        o.setName('message').setDescription('Add a personal touch to your letter (optional)').setRequired(false)
      )
      .setDMPermission(true)) as SlashCommandBuilder;
  }

  private buildLetter(sender: string, recipient: string, personal?: string): string {
    const opening = LETTER_OPENINGS[Math.floor(Math.random() * LETTER_OPENINGS.length)];
    const middle = LETTER_MIDDLES[Math.floor(Math.random() * LETTER_MIDDLES.length)];
    const closing = LETTER_CLOSINGS[Math.floor(Math.random() * LETTER_CLOSINGS.length)];

    let letter = `*My dearest ${recipient},*\n\n${opening}\n\n${middle}\n\n`;
    if (personal) letter += `*"${personal}"*\n\n`;
    letter += `${closing}\n\n— *${sender}* 💌`;
    return letter;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    try {
      const target = i.options.getUser('user', true);
      const personal = i.options.getString('message') ?? undefined;

      if (target.id === i.user.id) {
        await i.reply({ content: '❌ You cannot send a love letter to yourself!', ephemeral: true });
        return;
      }

      if (target.bot) {
        await i.reply({ content: '❌ Bots cannot receive love letters... yet! 🤖💔', ephemeral: true });
        return;
      }

      const letter = this.buildLetter(i.user.username, target.username, personal ?? undefined);

      const embed = new EmbedBuilder()
        .setTitle('💌 A Love Letter')
        .setDescription(letter)
        .setColor(COLORS.default)
        .addFields({ name: '📬 From', value: i.user.toString(), inline: true }, { name: '📮 To', value: target.toString(), inline: true })
        .setThumbnail(target.displayAvatarURL())
        .setFooter({ text: 'Sealed with love 💕' })
        .setTimestamp();

      await i.reply({ embeds: [embed] });
    } catch (err) {
      console.error('[LoveLetterCommand] Error:', err);
      await i.reply({ content: '❌ Could not send the love letter. Please try again.', ephemeral: true });
    }
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    try {
      const target = m.mentions.users.first();
      if (!target) {
        await m.reply('❌ Please mention a user to send a love letter to! Example: `loveletter @user`');
        return;
      }

      if (target.id === m.author.id) {
        await m.reply('❌ You cannot send a love letter to yourself!');
        return;
      }

      if (target.bot) {
        await m.reply('❌ Bots cannot receive love letters... yet! 🤖💔');
        return;
      }

      const personal = args.slice(1).join(' ') || undefined;
      const letter = this.buildLetter(m.author.username, target.username, personal);

      const embed = new EmbedBuilder()
        .setTitle('💌 A Love Letter')
        .setDescription(letter)
        .setColor(COLORS.default)
        .addFields({ name: '📬 From', value: m.author.toString(), inline: true }, { name: '📮 To', value: target.toString(), inline: true })
        .setThumbnail(target.displayAvatarURL())
        .setFooter({ text: 'Sealed with love 💕' })
        .setTimestamp();

      await m.reply({ embeds: [embed] });
    } catch (err) {
      console.error('[LoveLetterCommand] Error:', err);
      await m.reply('❌ Could not send the love letter. Please try again.');
    }
  }
}

export default LoveLetterCommand;
