import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';

const GIFS = [
  'https://media.giphy.com/media/5xaOcLGvzHxDKjufnLW/giphy.gif',
  'https://media.giphy.com/media/blSTtZehjAZ8I/giphy.gif',
  'https://media.giphy.com/media/YoB1eEFB6FZ1Re4AzA/giphy.gif',
  'https://media.giphy.com/media/3o6ZtpxSZbQRRnwCKQ/giphy.gif',
  'https://media.giphy.com/media/xTiTnBKe5yHlYf3Ji0/giphy.gif',
  'https://media.giphy.com/media/6oMKugqovQnjW/giphy.gif',
  'https://media.giphy.com/media/VbnUQpnihPSIgIXuZv/giphy.gif',
];

const SOLO_MESSAGES = [
  '💃 **{user}** is busting some moves!',
  '🕺 **{user}** is dancing like no one\'s watching!',
  '💃 **{user}** hits the dance floor!',
  '🎵 **{user}** vibes and dances to the beat!',
];

const DUO_MESSAGES = [
  '💃 **{user}** dances with **{target}**!',
  '🕺 **{user}** and **{target}** hit the dance floor together!',
  '🎵 **{user}** pulls **{target}** in for a dance!',
];

export class DanceCommand extends BaseCommand {
  constructor() {
    super({ name: 'dance', description: 'Dance alone or with someone! 💃', category: 'social', premiumTier: 'free', cooldown: 3, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['groove', 'boogie'], examples: ['/dance', '/dance @user', 'p!dance', 'p!dance @user'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addUserOption(o => o.setName('user').setDescription('Who to dance with (optional)').setRequired(false))
      .setDMPermission(true)) as SlashCommandBuilder;
  }

  private gif() { return GIFS[Math.floor(Math.random() * GIFS.length)]; }

  private msg(user: string, target?: string): string {
    if (target) {
      const tpl = DUO_MESSAGES[Math.floor(Math.random() * DUO_MESSAGES.length)];
      return tpl.replace('{user}', user).replace('{target}', target);
    }
    const tpl = SOLO_MESSAGES[Math.floor(Math.random() * SOLO_MESSAGES.length)];
    return tpl.replace('{user}', user);
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const t = i.options.getUser('user');
    const embed = new EmbedBuilder()
      .setDescription(this.msg(i.user.username, t?.username))
      .setImage(this.gif())
      .setColor(COLORS.default)
      .setFooter({ text: 'Panindigan Social' });
    await i.reply({ embeds: [embed] });
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    const t = m.mentions.users.first();
    const embed = new EmbedBuilder()
      .setDescription(this.msg(m.author.username, t?.username))
      .setImage(this.gif())
      .setColor(COLORS.default)
      .setFooter({ text: 'Panindigan Social' });
    await m.reply({ embeds: [embed] });
  }
}
export default DanceCommand;
