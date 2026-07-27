// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
const GIFS = [
    'https://media.giphy.com/media/3o7btNa0RUYa5E7iiQ/giphy.gif',
    'https://media.giphy.com/media/l46CyJmS9KUbokzsI/giphy.gif',
    'https://media.giphy.com/media/5hc2pFFBLcgMnfCgmf/giphy.gif',
];
export class FlexCommand extends BaseCommand {
    constructor() {
        super({ name: 'flex', description: 'Flex your muscles! 💪', category: 'social', premiumTier: 'silver', cooldown: 3, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['showoff', 'muscle'], examples: ['/flex', 'p!flex'] });
    }
    gif() { return GIFS[Math.floor(Math.random() * GIFS.length)]; }
    async executeSlash(i) {
        const embed = new EmbedBuilder()
            .setDescription(`💪 **${i.user.username}** is flexing their muscles! 💪`)
            .setImage(this.gif()).setColor(COLORS.gold).setFooter({ text: 'Panindigan Social' });
        await i.reply({ embeds: [embed] });
    }
    async executePrefix(m, _args) {
        const embed = new EmbedBuilder()
            .setDescription(`💪 **${m.author.username}** is flexing their muscles! 💪`)
            .setImage(this.gif()).setColor(COLORS.gold).setFooter({ text: 'Panindigan Social' });
        await m.reply({ embeds: [embed] });
    }
}
export default FlexCommand;
