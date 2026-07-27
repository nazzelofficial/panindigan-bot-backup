// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
const GIFS = [
    'https://media.giphy.com/media/9M5jK4GgSaEi9lZ7wi/giphy.gif',
    'https://media.giphy.com/media/uJJSHPMaAMOPYS0pUv/giphy.gif',
    'https://media.giphy.com/media/8vQSQ3cNXuDGo/giphy.gif',
];
export class ShootCommand extends BaseCommand {
    constructor() {
        super({ name: 'shoot', description: 'Shoot someone (for fun)! 🔫', category: 'social', premiumTier: 'gold', cooldown: 3, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['bang', 'pew'], examples: ['/shoot @user', 'p!shoot @user'] });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
            .addUserOption(o => o.setName('user').setDescription('Who to shoot (playfully!)').setRequired(true)));
    }
    gif() { return GIFS[Math.floor(Math.random() * GIFS.length)]; }
    async executeSlash(i) {
        const t = i.options.getUser('user', true);
        const embed = new EmbedBuilder()
            .setDescription(`🔫 **${i.user.username}** shoots **${t.username}**! BANG! 💥`)
            .setImage(this.gif()).setColor(COLORS.error).setFooter({ text: 'Panindigan Social • For fun only!' });
        await i.reply({ embeds: [embed] });
    }
    async executePrefix(m, _args) {
        const t = m.mentions.users.first();
        if (!t) {
            await m.reply('❌ Mention someone to shoot!');
            return;
        }
        const embed = new EmbedBuilder()
            .setDescription(`🔫 **${m.author.username}** shoots **${t.username}**! BANG! 💥`)
            .setImage(this.gif()).setColor(COLORS.error).setFooter({ text: 'For fun only!' });
        await m.reply({ embeds: [embed] });
    }
}
export default ShootCommand;
