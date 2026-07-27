// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
const GIFS = [
    'https://media.giphy.com/media/WvSrQA5EqMmyFy6LXS/giphy.gif',
    'https://media.giphy.com/media/3oqFUQNyBfRWN8Sppu/giphy.gif',
    'https://media.giphy.com/media/hS5bCJJPNAlBDuTKMY/giphy.gif',
];
export class BonkCommand extends BaseCommand {
    constructor() {
        super({
            name: 'bonk',
            description: 'Bonk someone on the head! 🔨',
            category: 'social',
            premiumTier: 'free',
            cooldown: 5,
            ownerOnly: false,
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['bop'],
            examples: ['/bonk @user', 'p!bonk @user'],
        });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption(o => o.setName('user').setDescription('Who to bonk').setRequired(true)));
    }
    gif() { return GIFS[Math.floor(Math.random() * GIFS.length)]; }
    async executeSlash(i) {
        try {
            const t = i.options.getUser('user', true);
            const desc = t.id === i.user.id
                ? `🔨 **${i.user.username}** bonks themselves! Go to horny jail!`
                : `🔨 **${i.user.username}** bonks **${t.username}** on the head! Go to horny jail!`;
            const embed = new EmbedBuilder()
                .setDescription(desc)
                .setImage(this.gif())
                .setColor(COLORS.warning)
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
                await m.reply('❌ Mention someone to bonk!');
                return;
            }
            const desc = t.id === m.author.id
                ? `🔨 **${m.author.username}** bonks themselves! Go to horny jail!`
                : `🔨 **${m.author.username}** bonks **${t.username}** on the head! Go to horny jail!`;
            const embed = new EmbedBuilder()
                .setDescription(desc)
                .setImage(this.gif())
                .setColor(COLORS.warning)
                .setFooter({ text: 'Panindigan Social' });
            await m.reply({ embeds: [embed] });
        }
        catch (err) {
            await m.reply('❌ Something went wrong!');
        }
    }
}
export default BonkCommand;
