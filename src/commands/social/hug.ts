// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';

const GIFS = [
  'https://media.giphy.com/media/od5H3PmEG5EVq/giphy.gif',
  'https://media.giphy.com/media/EvYhaOoMYKuuJFMxGO/giphy.gif',
  'https://media.giphy.com/media/ZBQhoZC0nqknSviPqT/giphy.gif',
  'https://media.giphy.com/media/lrr9rHuoJOE0w/giphy.gif',
];

export class HugCommand extends BaseCommand {
  constructor() {
    super({
      name: 'hug',
      description: 'Give someone a warm hug! 🤗',
      category: 'social',
      premiumTier: 'free',
      cooldown: 3,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['abrazo'],
      examples: ['/hug @user', 'p!hug @user'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addUserOption(o => o.setName('user').setDescription('Who to hug').setRequired(true))) as SlashCommandBuilder;
  }

  private gif() { return GIFS[Math.floor(Math.random() * GIFS.length)]; }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const t = i.options.getUser('user', true);
    if (t.id === i.user.id) {
      await i.reply({ content: '🥺 Hugging yourself? Okay, here\'s a virtual hug! 🤗', ephemeral: true });
      return;
    }
    if (t.bot) {
      await i.reply({ content: `🤖 *${i.user.username}* hugs the bot! Beep boop! 🤖`, ephemeral: false });
      return;
    }
    const embed = new EmbedBuilder()
      .setDescription(`💞 **${i.user.username}** hugs **${t.username}**!`)
      .setImage(this.gif()).setColor(COLORS.default).setFooter({ text: 'Panindigan Social' });
    await i.reply({ embeds: [embed] });
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    const t = m.mentions.users.first();
    if (!t) { await m.reply('❌ Mention someone to hug!'); return; }
    if (t.id === m.author.id) { await m.reply('🥺 Hugging yourself? That\'s okay! 🤗'); return; }
    const embed = new EmbedBuilder()
      .setDescription(`💞 **${m.author.username}** hugs **${t.username}**!`)
      .setImage(this.gif()).setColor(COLORS.default).setFooter({ text: 'Panindigan Social' });
    await m.reply({ embeds: [embed] });
  }
}
export default HugCommand;
