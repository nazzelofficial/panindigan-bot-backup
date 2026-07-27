// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
const GIFS = ['https://media.giphy.com/media/VkMV9TldsPd28/giphy.gif'];
export class SmugCommand extends BaseCommand {
    constructor() { super({ name: 'smug', description: 'Look smug! 😏', category: 'social', premiumTier: 'free', cooldown: 3, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: [], examples: ['/smug'] }); }
    async executeSlash(i) { await i.reply({ embeds: [new EmbedBuilder().setDescription(`😏 **${i.user.username}** looks smug!`).setImage(GIFS[0]).setColor(COLORS.default)] }); }
    async executePrefix(m, _args) { await m.reply({ embeds: [new EmbedBuilder().setDescription(`😏 **${m.author.username}** looks smug!`).setImage(GIFS[0]).setColor(COLORS.default)] }); }
}
export default SmugCommand;
