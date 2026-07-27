// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';

const GIFS = [
  'https://media.giphy.com/media/PhO5RsJEHvQas/giphy.gif',
  'https://media.giphy.com/media/xUOxf7XfmpxuSode1O/giphy.gif',
  'https://media.giphy.com/media/13sYPCOr5f8NkY/giphy.gif',
];

export class PunchCommand extends BaseCommand {
  constructor() {
    super({
      name: 'punch',
      description: 'Punch someone (for fun!) 👊',
      category: 'social',
      premiumTier: 'free',
      cooldown: 5,
      ownerOnly: false,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['hit'],
      examples: ['/punch @user', 'p!punch @user'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addUserOption(o => o.setName('user').setDescription('Who to punch').setRequired(true))) as SlashCommandBuilder;
  }

  private gif() { return GIFS[Math.floor(Math.random() * GIFS.length)]; }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    try {
      const t = i.options.getUser('user', true);
      const desc = t.id === i.user.id
        ? `👊 **${i.user.username}** punches themselves... ouch!`
        : `👊 **${i.user.username}** punches **${t.username}**! (For fun only!)`;
      const embed = new EmbedBuilder()
        .setDescription(desc)
        .setImage(this.gif())
        .setColor(COLORS.error)
        .setFooter({ text: 'Panindigan Social • This is just for fun!' });
      await i.reply({ embeds: [embed] });
    } catch (err) {
      await i.reply({ content: '❌ Something went wrong!', ephemeral: true });
    }
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    try {
      const t = m.mentions.users.first();
      if (!t) { await m.reply('❌ Mention someone to punch!'); return; }
      const desc = t.id === m.author.id
        ? `👊 **${m.author.username}** punches themselves... ouch!`
        : `👊 **${m.author.username}** punches **${t.username}**! (For fun only!)`;
      const embed = new EmbedBuilder()
        .setDescription(desc)
        .setImage(this.gif())
        .setColor(COLORS.error)
        .setFooter({ text: 'Panindigan Social • This is just for fun!' });
      await m.reply({ embeds: [embed] });
    } catch (err) {
      await m.reply('❌ Something went wrong!');
    }
  }
}
export default PunchCommand;
