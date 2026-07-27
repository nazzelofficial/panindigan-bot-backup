// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class RoastCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'roast',
            description: 'Roast someone (fun - joke command)',
            category: 'fun',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['burn'],
            examples: ['/roast @user', 'p!roast @user'],
        };
        super(options);
    }
    roasts = [
        'You\'re not completely useless, you can always serve as a bad example.',
        'I\'d agree with you but then we\'d both be wrong.',
        'You have the right to remain silent because whatever you say will probably be stupid anyway.',
        'I\'m jealous of all the people that haven\'t met you.',
        'You\'re the reason God created the middle finger.',
        'If you were any slower, you\'d be going backwards.',
        'You\'re a gray sprinkle on a rainbow cupcake.',
        'I\'d explain it to you but I don\'t have any crayons.',
        'You\'re not dumb, you just have bad luck thinking.',
        'Your brain is smoother than a marble.',
    ];
    async executeSlash(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        const roast = this.roasts[Math.floor(Math.random() * this.roasts.length)];
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} 🔥 Roast`)
            .setColor(COLORS.warning)
            .setDescription(`${user}, ${roast}`)
            .addFields([
            { name: 'Note', value: 'This is a joke command! All in good fun!', inline: false },
        ])
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message) {
        const user = message.mentions.users.first() || message.author;
        const roast = this.roasts[Math.floor(Math.random() * this.roasts.length)];
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.fun} 🔥 Roast`)
            .setColor(COLORS.warning)
            .setDescription(`${user}, ${roast}`)
            .addFields([
            { name: 'Note', value: 'This is a joke command! All in good fun!', inline: false },
        ])
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default RoastCommand;
