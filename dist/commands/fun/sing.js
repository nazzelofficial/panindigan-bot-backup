// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class SingCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'sing',
            description: 'Sing a song',
            category: 'fun',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['song', 'music'],
            examples: ['/sing', 'p!sing'],
        };
        super(options);
    }
    songs = [
        '🎵 La la la~ I\'m singing a beautiful song!',
        '🎶 Do re mi fa sol la ti do!',
        '🎤 Singing in the rain, just singing in the rain!',
        '🎵 Never gonna give you up, never gonna let you down!',
        '🎶 I will always love you~',
        '🎤 Bohemian Rhapsody is my jam!',
        '🎵 Sweet Caroline, bum bum bum~',
        '🎶 Take me home, country roads!',
    ];
    async executeSlash(interaction) {
        const song = this.songs[Math.floor(Math.random() * this.songs.length)];
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} 🎤 Sing`)
            .setColor(COLORS.info)
            .setDescription(`${interaction.user} ${song}`)
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message) {
        const song = this.songs[Math.floor(Math.random() * this.songs.length)];
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} 🎤 Sing`)
            .setColor(COLORS.info)
            .setDescription(`${message.author} ${song}`)
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default SingCommand;
