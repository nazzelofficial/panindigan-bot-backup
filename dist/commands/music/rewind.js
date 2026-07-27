// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class RewindCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'rewind',
            description: 'Rewind the current song by a specified time',
            category: 'music',
            cooldown: 3,
            userPermissions: [PermissionFlagsBits.Connect],
            botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['rw', 'back'],
            examples: ['/rewind 10', 'p!rewind 30'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const seconds = interaction.options.getInteger('seconds');
        if (seconds === null || seconds < 0) {
            await interaction.reply({ content: '❌ Please provide a valid number of seconds.', ephemeral: true });
            return;
        }
        if (!interaction.guild || !interaction.member)
            return;
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            await interaction.reply({ content: '❌ You need to be in a voice channel to rewind.', ephemeral: true });
            return;
        }
        try {
            const client = interaction.client;
            const musicManager = client.kazagumo;
            if (!musicManager) {
                await interaction.reply({ content: '❌ Music system is not available.', ephemeral: true });
                return;
            }
            const player = client.kazagumo.players.get(interaction.guild.id);
            if (!player || !player.currentTrack) {
                await interaction.reply({ content: '❌ Nothing is currently playing.', ephemeral: true });
                return;
            }
            if (player.voiceChannel !== voiceChannel.id) {
                await interaction.reply({ content: '❌ You need to be in the same voice channel as the bot.', ephemeral: true });
                return;
            }
            const newPosition = Math.max(0, player.position - seconds);
            await player.seek(newPosition);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.music} Rewound`)
                .setColor(COLORS.success)
                .addFields([
                { name: 'Rewound by', value: `${seconds} seconds`, inline: true },
                { name: 'Requested by', value: interaction.user.tag, inline: true },
            ])
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }
        catch (error) {
            await interaction.reply({ content: '❌ Failed to rewind.', ephemeral: true });
        }
    }
    async executePrefix(message, _args) {
        const seconds = parseInt(args[0]);
        if (isNaN(seconds) || seconds < 0) {
            await message.reply('❌ Please provide a valid number of seconds.');
            return;
        }
        if (!message.guild || !message.member)
            return;
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            await message.reply('❌ You need to be in a voice channel to rewind.');
            return;
        }
        try {
            const client = message.client;
            const musicManager = client.kazagumo;
            if (!musicManager) {
                await message.reply('❌ Music system is not available.');
                return;
            }
            const player = client.kazagumo.players.get(message.guild.id);
            if (!player || !player.currentTrack) {
                await message.reply('❌ Nothing is currently playing.');
                return;
            }
            if (player.voiceChannel !== voiceChannel.id) {
                await message.reply('❌ You need to be in the same voice channel as the bot.');
                return;
            }
            const newPosition = Math.max(0, player.position - seconds);
            await player.seek(newPosition);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.music} Rewound`)
                .setColor(COLORS.success)
                .addFields([
                { name: 'Rewound by', value: `${seconds} seconds`, inline: true },
                { name: 'Requested by', value: message.author.tag, inline: true },
            ])
                .setTimestamp();
            await message.reply({ embeds: [embed] });
        }
        catch (error) {
            await message.reply('❌ Failed to rewind.');
        }
    }
}
export default RewindCommand;
