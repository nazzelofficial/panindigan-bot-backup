// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
const SCENARIOS = [
    'challenged them to a duel and won!',
    'defeated them in an epic battle!',
    'dropped a piano on them... somehow.',
    'used the power of friendship to obliterate them.',
    'sent them to the shadow realm!',
    'eliminated them with an RKO outta nowhere!',
];
const GIFS = [
    'https://media.giphy.com/media/l2JJKs3I69qfaQleE/giphy.gif',
    'https://media.giphy.com/media/3oEjI5VtIhHvK37WYo/giphy.gif',
];
export class KillCommand extends BaseCommand {
    constructor() {
        super({
            name: 'kill',
            description: 'Dramatically "kill" someone in the most anime way! (Fun only) ⚔️',
            category: 'social',
            premiumTier: 'free',
            cooldown: 5,
            ownerOnly: false,
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['slay'],
            examples: ['/kill @user', 'p!kill @user'],
        });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption(o => o.setName('user').setDescription('Who to dramatically "kill"').setRequired(true)));
    }
    gif() { return GIFS[Math.floor(Math.random() * GIFS.length)]; }
    scenario() { return SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)]; }
    async executeSlash(i) {
        try {
            const t = i.options.getUser('user', true);
            if (t.id === i.user.id) {
                await i.reply({ content: '💀 You tried to kill yourself dramatically... but tripped over your shoelaces instead.', ephemeral: false });
                return;
            }
            const embed = new EmbedBuilder()
                .setDescription(`⚔️ **${i.user.username}** ${this.scenario()} **${t.username}** is done for! 💀\n\n*This is purely for fun!*`)
                .setImage(this.gif())
                .setColor(COLORS.error)
                .setFooter({ text: 'Panindigan Social • For fun only!' });
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
                await m.reply('❌ Mention someone to dramatically take down!');
                return;
            }
            if (t.id === m.author.id) {
                await m.reply('💀 You tried to kill yourself dramatically... but tripped over your shoelaces instead.');
                return;
            }
            const embed = new EmbedBuilder()
                .setDescription(`⚔️ **${m.author.username}** ${this.scenario()} **${t.username}** is done for! 💀\n\n*This is purely for fun!*`)
                .setImage(this.gif())
                .setColor(COLORS.error)
                .setFooter({ text: 'Panindigan Social • For fun only!' });
            await m.reply({ embeds: [embed] });
        }
        catch (err) {
            await m.reply('❌ Something went wrong!');
        }
    }
}
export default KillCommand;
