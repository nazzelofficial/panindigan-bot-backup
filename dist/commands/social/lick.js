// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
const GIFS = [
    'https://media.giphy.com/media/G3va31oEEnIkM/giphy.gif',
    'https://media.giphy.com/media/3iRHaCXsm9VTQH3mTR/giphy.gif',
    'https://media.giphy.com/media/2yP1jNgjNAkvu/giphy.gif',
    'https://media.giphy.com/media/GqHFRTFW5lNe/giphy.gif',
    'https://media.giphy.com/media/Fpz6MTbQNqjao/giphy.gif',
];
const MESSAGES = [
    '{user} licks {target}! 👅 Yuck!',
    '{user} gives {target} an unexpected lick! 😜',
    '{user} licks {target} like an ice cream 🍦',
    '{user} just... licked {target}? 🫠',
    '{user} goes in for the lick on {target}! 👅',
];
export class LickCommand extends BaseCommand {
    constructor() {
        super({ name: 'lick', description: 'Lick someone! 👅', category: 'social', premiumTier: 'free', cooldown: 3, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['slurp'], examples: ['/lick @user', 'p!lick @user'] });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption(o => o.setName('user').setDescription('Who to lick').setRequired(true))
            .setDMPermission(true));
    }
    gif() { return GIFS[Math.floor(Math.random() * GIFS.length)]; }
    msg(user, target) {
        const tpl = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
        return tpl.replace('{user}', `**${user}**`).replace('{target}', `**${target}**`);
    }
    async executeSlash(i) {
        const t = i.options.getUser('user', true);
        await i.reply({ embeds: [new EmbedBuilder().setDescription(this.msg(i.user.username, t.username)).setImage(this.gif()).setColor(COLORS.default).setFooter({ text: 'Panindigan Social' })] });
    }
    async executePrefix(m, _args) {
        const t = m.mentions.users.first();
        if (!t) {
            await m.reply('❌ Mention someone to lick!');
            return;
        }
        await m.reply({ embeds: [new EmbedBuilder().setDescription(this.msg(m.author.username, t.username)).setImage(this.gif()).setColor(COLORS.default).setFooter({ text: 'Panindigan Social' })] });
    }
}
export default LickCommand;
