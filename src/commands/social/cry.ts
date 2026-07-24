import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';
const GIFS = ['https://media.giphy.com/media/d2lcHJTG5Tscg/giphy.gif','https://media.giphy.com/media/LPn5wFD9D7Y1G/giphy.gif','https://media.giphy.com/media/Rkis28kMJd1aE/giphy.gif'];
export class CryCommand extends BaseCommand {
  constructor() { super({ name: 'cry', description: 'Express your sadness 😢', category: 'social', premiumTier: 'free', cooldown: 3, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['sad', 'sob'], examples: ['/cry', 'p!cry'] } as CommandOptions); }
  private gif() { return GIFS[Math.floor(Math.random() * GIFS.length)]; }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> { await i.reply({ embeds: [new EmbedBuilder().setDescription(`😢 **${i.user.username}** is crying...`).setImage(this.gif()).setColor(COLORS.info)] }); }
  public async executePrefix(m: Message, args: string[]): Promise<void> { await m.reply({ embeds: [new EmbedBuilder().setDescription(`😢 **${m.author.username}** is crying...`).setImage(this.gif()).setColor(COLORS.info)] }); }
}
export default CryCommand;
