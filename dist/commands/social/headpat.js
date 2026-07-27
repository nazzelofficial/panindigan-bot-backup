// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
const GIFS = [
    'https://media.giphy.com/media/5tmRHwTlHAZB2/giphy.gif',
    'https://media.giphy.com/media/N0CIxcyPLROpa/giphy.gif',
    'https://media.giphy.com/media/ve43TyUdHFijW/giphy.gif',
];
export class HeadpatCommand extends BaseCommand {
    constructor() {
        super({
            name: 'headpat',
            description: 'Give someone a gentle headpat! 🤚',
            category: 'social',
            premiumTier: 'free',
            cooldown: 5,
            ownerOnly: false,
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['pat2', 'head'],
            examples: ['/headpat @user', 'p!headpat @user'],
        });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption(o => o.setName('user').setDescription('Who to headpat').setRequired(true)));
    }
    gif() { return GIFS[Math.floor(Math.random() * GIFS.length)]; }
    async executeSlash(i) {
        try {
            const t = i.options.getUser('user', true);
            const embed = new EmbedBuilder()
                .setDescription(`🤚 **${i.user.username}** gives **${t.username}** a gentle headpat! ✨`)
                .setImage(this.gif())
                .setColor(COLORS.default)
                .setFooter({ text: 'Panindigan Social' });
            await i.reply({ embeds: [embed] });
        }
        catch (err) {
            await i.reply({ content: '❌ Something went wrong!', ephemeral: true });
        }
    }
    async executePrefix(m, _args) {
        try {
            const t = m.mentions.users.first();
            if (!t) {
                await m.reply('❌ Mention someone to headpat!');
                return;
            }
            const embed = new EmbedBuilder()
                .setDescription(`🤚 **${m.author.username}** gives **${t.username}** a gentle headpat! ✨`)
                .setImage(this.gif())
                .setColor(COLORS.default)
                .setFooter({ text: 'Panindigan Social' });
            await m.reply({ embeds: [embed] });
        }
        catch (err) {
            await m.reply('❌ Something went wrong!');
        }
    }
}
export default HeadpatCommand;
