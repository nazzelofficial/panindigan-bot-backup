// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
const GIFS = [
    'https://media.giphy.com/media/d2lcHJTG5Tscg/giphy.gif',
    'https://media.giphy.com/media/3oEjHSGnr4FQsH4jWg/giphy.gif',
    'https://media.giphy.com/media/FqBTvSNjNzeZa/giphy.gif',
    'https://media.giphy.com/media/2A75RyXVzzSI2bx4Gj/giphy.gif',
    'https://media.giphy.com/media/oBPOP48aQpxlK/giphy.gif',
];
const MESSAGES = [
    '{user} noms on {target}! 😋',
    '{user} takes a bite out of {target}! 🍴',
    '{user} starts nom-nom-nomming on {target}! 😤',
    '{user} snack-attacks {target}! 🦈',
    '{user} cannot resist eating {target}! 😅',
];
export class NomCommand extends BaseCommand {
    constructor() {
        super({ name: 'nom', description: 'Nom on someone! 😋', category: 'social', premiumTier: 'free', cooldown: 3, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['eat', 'bite', 'munch'], examples: ['/nom @user', 'p!nom @user'] });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption(o => o.setName('user').setDescription('Who to nom').setRequired(true))
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
            await m.reply('❌ Mention someone to nom!');
            return;
        }
        await m.reply({ embeds: [new EmbedBuilder().setDescription(this.msg(m.author.username, t.username)).setImage(this.gif()).setColor(COLORS.default).setFooter({ text: 'Panindigan Social' })] });
    }
}
export default NomCommand;
