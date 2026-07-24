import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';

const GIFS = [
  'https://media.giphy.com/media/xT9IgG50Lg7rusNZ6A/giphy.gif',
  'https://media.giphy.com/media/yoJC2Olx1RvTSVaHoA/giphy.gif',
  'https://media.giphy.com/media/l3q2K5jinAlChoCLS/giphy.gif',
];

export class SleepCommand extends BaseCommand {
  constructor() {
    super({
      name: 'sleep',
      description: 'Show that you are sleepy 😴',
      category: 'social',
      premiumTier: 'free',
      cooldown: 5,
      ownerOnly: false,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['zzz', 'nap'],
      examples: ['/sleep', 'p!sleep'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description) as SlashCommandBuilder;
  }

  private gif() { return GIFS[Math.floor(Math.random() * GIFS.length)]; }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    try {
      const embed = new EmbedBuilder()
        .setDescription(`😴 **${i.user.username}** is going to sleep... zzz 💤`)
        .setImage(this.gif())
        .setColor(COLORS.default)
        .setFooter({ text: 'Panindigan Social • Sweet dreams!' });
      await i.reply({ embeds: [embed] });
    } catch (err) {
      await i.reply({ content: '❌ Something went wrong!', ephemeral: true });
    }
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    try {
      const embed = new EmbedBuilder()
        .setDescription(`😴 **${m.author.username}** is going to sleep... zzz 💤`)
        .setImage(this.gif())
        .setColor(COLORS.default)
        .setFooter({ text: 'Panindigan Social • Sweet dreams!' });
      await m.reply({ embeds: [embed] });
    } catch (err) {
      await m.reply('❌ Something went wrong!');
    }
  }
}
export default SleepCommand;
