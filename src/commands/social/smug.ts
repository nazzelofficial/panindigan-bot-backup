import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';
const GIFS = ['https://media.giphy.com/media/VkMV9TldsPd28/giphy.gif'];
export class SmugCommand extends BaseCommand {
  constructor() { super({ name: 'smug', description: 'Look smug! 😏', category: 'social', premiumTier: 'free', cooldown: 3, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: [], examples: ['/smug'] } as CommandOptions); }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> { await i.reply({ embeds: [new EmbedBuilder().setDescription(`😏 **${i.user.username}** looks smug!`).setImage(GIFS[0]).setColor(COLORS.default)] }); }
  public async executePrefix(m: Message, args: string[]): Promise<void> { await m.reply({ embeds: [new EmbedBuilder().setDescription(`😏 **${m.author.username}** looks smug!`).setImage(GIFS[0]).setColor(COLORS.default)] }); }
}
export default SmugCommand;
