import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';
const GIFS = ['https://media.giphy.com/media/5xaOcLGvzHxDKjufnLW/giphy.gif','https://media.giphy.com/media/blSTtZehjAZ8I/giphy.gif','https://media.giphy.com/media/YoB1eEFB6FZ1Re4AzA/giphy.gif'];
export class DanceCommand extends BaseCommand {
  constructor() { super({ name: 'dance', description: 'Dance! 💃', category: 'social', premiumTier: 'free', cooldown: 3, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['groove'], examples: ['/dance', 'p!dance'] } as CommandOptions); }
  private gif() { return GIFS[Math.floor(Math.random() * GIFS.length)]; }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> { await i.reply({ embeds: [new EmbedBuilder().setDescription(`💃 **${i.user.username}** is dancing!`).setImage(this.gif()).setColor(COLORS.default)] }); }
  public async executePrefix(m: Message, args: string[]): Promise<void> { await m.reply({ embeds: [new EmbedBuilder().setDescription(`💃 **${m.author.username}** is dancing!`).setImage(this.gif()).setColor(COLORS.default)] }); }
}
export default DanceCommand;
