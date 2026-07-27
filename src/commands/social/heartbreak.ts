// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';

const GIFS = [
  'https://media.giphy.com/media/GRnmvuDGnEVuE/giphy.gif',
  'https://media.giphy.com/media/3oEjHAUOqG3lSS0f1C/giphy.gif',
  'https://media.giphy.com/media/evMSpFJZgMZe4WDsIR/giphy.gif',
];

const MESSAGES = [
  'My heart is shattered into a million pieces... 💔',
  'It hurts so much... pero kaya ko pa \'to... 💔',
  'Parang tinanggal mo ang puso ko... at sinira mo pa. 💔',
  'Why does love have to hurt this much? 💔',
  'Galing tayo sa magkaibang mundo... at tila hindi tayo magtatagpo. 💔',
  'Heartbroken, pero sisigla ulit. Para sa drama lang naman \'to! 😂💔',
];

export class HeartbreakCommand extends BaseCommand {
  constructor() {
    super({ name: 'heartbreak', description: 'Dramatic heartbreak message generator (for fun!) 💔', category: 'social', premiumTier: 'gold', cooldown: 3, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['broken', 'sadlove', 'heartbroken'], examples: ['/heartbreak', 'p!heartbreak'] } as CommandOptions);
  }

  private gif() { return GIFS[Math.floor(Math.random() * GIFS.length)]; }
  private msg() { return MESSAGES[Math.floor(Math.random() * MESSAGES.length)]; }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle('💔 Heartbreak...')
      .setDescription(`**${i.user.username}** is dramatically heartbroken!\n\n*"${this.msg()}"*`)
      .setImage(this.gif())
      .setColor(COLORS.error)
      .setFooter({ text: 'For dramatic purposes only 😂' });
    await i.reply({ embeds: [embed] });
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle('💔 Heartbreak...')
      .setDescription(`**${m.author.username}** is dramatically heartbroken!\n\n*"${this.msg()}"*`)
      .setImage(this.gif())
      .setColor(COLORS.error)
      .setFooter({ text: 'For dramatic purposes only 😂' });
    await m.reply({ embeds: [embed] });
  }
}
export default HeartbreakCommand;
