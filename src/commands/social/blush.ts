// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
const GIFS = ['https://media.giphy.com/media/TFSxpAIYz5inS/giphy.gif'];
export class BlushCommand extends BaseCommand {
  constructor() { super({ name: 'blush', description: 'Show that you\'re blushing! 😊', category: 'social', premiumTier: 'free', cooldown: 3, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: [], examples: ['/blush', 'p!blush'] } as CommandOptions); }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> { await i.reply({ embeds: [new EmbedBuilder().setDescription(`😊 **${i.user.username}** is blushing!`).setImage(GIFS[0]).setColor(COLORS.default)] }); }
  public async executePrefix(m: Message, _args: string[]): Promise<void> { await m.reply({ embeds: [new EmbedBuilder().setDescription(`😊 **${m.author.username}** is blushing!`).setImage(GIFS[0]).setColor(COLORS.default)] }); }
}
export default BlushCommand;
