// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
const GIFS = [
    'https://media.giphy.com/media/a5viI92PAF89q/giphy.gif',
    'https://media.giphy.com/media/kPrlykQ7bIRmG68xPE/giphy.gif',
    'https://media.giphy.com/media/l1KVaj5UcbHwrBMqI/giphy.gif',
];
export class ThinkCommand extends BaseCommand {
    constructor() {
        super({ name: 'think', description: 'Strike a thinking pose 🤔', category: 'social', premiumTier: 'silver', cooldown: 3, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['thinking', 'ponder'], examples: ['/think', 'p!think'] });
    }
    gif() { return GIFS[Math.floor(Math.random() * GIFS.length)]; }
    async executeSlash(i) {
        const embed = new EmbedBuilder()
            .setDescription(`🤔 **${i.user.username}** is deep in thought...`)
            .setImage(this.gif()).setColor(COLORS.info).setFooter({ text: 'Panindigan Social' });
        await i.reply({ embeds: [embed] });
    }
    async executePrefix(m, _args) {
        const embed = new EmbedBuilder()
            .setDescription(`🤔 **${m.author.username}** is deep in thought...`)
            .setImage(this.gif()).setColor(COLORS.info).setFooter({ text: 'Panindigan Social' });
        await m.reply({ embeds: [embed] });
    }
}
export default ThinkCommand;
