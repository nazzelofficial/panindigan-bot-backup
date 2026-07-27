// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
const GIFS = ['https://media.giphy.com/media/pWd3gD577gOqs/giphy.gif', 'https://media.giphy.com/media/DccMDMgnRoXmg/giphy.gif'];
export class PokeCommand extends BaseCommand {
    constructor() { super({ name: 'poke', description: 'Poke someone! 👉', category: 'social', premiumTier: 'free', cooldown: 3, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['nudge'], examples: ['/poke @user'] }); }
    buildSlashCommand() { return (new SlashCommandBuilder().setName(this.name).setDescription(this.description).addUserOption(o => o.setName('user').setDescription('Who to poke').setRequired(true))); }
    gif() { return GIFS[Math.floor(Math.random() * GIFS.length)]; }
    async executeSlash(i) { const t = i.options.getUser('user', true); await i.reply({ embeds: [new EmbedBuilder().setDescription(`👉 **${i.user.username}** pokes **${t.username}**!`).setImage(this.gif()).setColor(COLORS.default)] }); }
    async executePrefix(m, _args) { const t = m.mentions.users.first(); if (!t) {
        await m.reply('❌ Mention someone!');
        return;
    } await m.reply({ embeds: [new EmbedBuilder().setDescription(`👉 **${m.author.username}** pokes **${t.username}**!`).setImage(this.gif()).setColor(COLORS.default)] }); }
}
export default PokeCommand;
