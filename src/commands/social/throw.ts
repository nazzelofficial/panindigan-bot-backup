import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';

const ITEMS = ['🍅 a tomato', '🥚 an egg', '🎂 a cake', '🐟 a fish', '☁️ a cloud', '🪣 a bucket of water', '🧁 a cupcake', '🥖 a baguette'];
const GIFS = [
  'https://media.giphy.com/media/3oEjHBa34dVLv0jnoc/giphy.gif',
  'https://media.giphy.com/media/l0Exnl9JmSWfjfO5q/giphy.gif',
  'https://media.giphy.com/media/JmD9mkDmzvXE7nxy7j/giphy.gif',
];

export class ThrowCommand extends BaseCommand {
  constructor() {
    super({
      name: 'throw',
      description: 'Throw something at a user! 🎯',
      category: 'social',
      premiumTier: 'free',
      cooldown: 5,
      ownerOnly: false,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['toss'],
      examples: ['/throw @user', 'p!throw @user'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addUserOption(o => o.setName('user').setDescription('Who to throw at').setRequired(true))) as SlashCommandBuilder;
  }

  private gif() { return GIFS[Math.floor(Math.random() * GIFS.length)]; }
  private item() { return ITEMS[Math.floor(Math.random() * ITEMS.length)]; }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    try {
      const t = i.options.getUser('user', true);
      const item = this.item();
      const embed = new EmbedBuilder()
        .setDescription(`🎯 **${i.user.username}** throws ${item} at **${t.username}**!`)
        .setImage(this.gif())
        .setColor(COLORS.default)
        .setFooter({ text: 'Panindigan Social' });
      await i.reply({ embeds: [embed] });
    } catch (err) {
      await i.reply({ content: '❌ Something went wrong!', ephemeral: true });
    }
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    try {
      const t = m.mentions.users.first();
      if (!t) { await m.reply('❌ Mention someone to throw at!'); return; }
      const item = this.item();
      const embed = new EmbedBuilder()
        .setDescription(`🎯 **${m.author.username}** throws ${item} at **${t.username}**!`)
        .setImage(this.gif())
        .setColor(COLORS.default)
        .setFooter({ text: 'Panindigan Social' });
      await m.reply({ embeds: [embed] });
    } catch (err) {
      await m.reply('❌ Something went wrong!');
    }
  }
}
export default ThrowCommand;
