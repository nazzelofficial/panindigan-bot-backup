// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';

const GIFS = [
  'https://media.giphy.com/media/pKxWEzNyXpPgk/giphy.gif',
  'https://media.giphy.com/media/OLPsCbh2N7mLi/giphy.gif',
  'https://media.giphy.com/media/4bpMkAQfNxTwovKrCb/giphy.gif',
];

export class TickleCommand extends BaseCommand {
  constructor() {
    super({
      name: 'tickle',
      description: 'Tickle someone! 🤣',
      category: 'social',
      premiumTier: 'free',
      cooldown: 5,
      ownerOnly: false,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['tease'],
      examples: ['/tickle @user', 'p!tickle @user'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addUserOption(o => o.setName('user').setDescription('Who to tickle').setRequired(true))) as SlashCommandBuilder;
  }

  private gif() { return GIFS[Math.floor(Math.random() * GIFS.length)]; }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    try {
      const t = i.options.getUser('user', true);
      const embed = new EmbedBuilder()
        .setDescription(`🤣 **${i.user.username}** tickles **${t.username}**! Hahaha stop stop stop! 😂`)
        .setImage(this.gif())
        .setColor(COLORS.default)
        .setFooter({ text: 'Panindigan Social' });
      await i.reply({ embeds: [embed] });
    } catch (err) {
      await i.reply({ content: '❌ Something went wrong!', ephemeral: true });
    }
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    try {
      const t = m.mentions.users.first();
      if (!t) { await m.reply('❌ Mention someone to tickle!'); return; }
      const embed = new EmbedBuilder()
        .setDescription(`🤣 **${m.author.username}** tickles **${t.username}**! Hahaha stop stop stop! 😂`)
        .setImage(this.gif())
        .setColor(COLORS.default)
        .setFooter({ text: 'Panindigan Social' });
      await m.reply({ embeds: [embed] });
    } catch (err) {
      await m.reply('❌ Something went wrong!');
    }
  }
}
export default TickleCommand;
