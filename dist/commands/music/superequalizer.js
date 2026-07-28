// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class SuperEqualizerCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'superequalizer',
            description: 'Apply super equalizer filter',
            category: 'music',
            cooldown: 3,
            userPermissions: [PermissionFlagsBits.Connect],
            botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['superbass', 'sbeq'],
            examples: ['/superequalizer', 'p!superequalizer'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        if (!interaction.guild || !interaction.member)
            return;
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            await interaction.reply({ content: '❌ You need to be in a voice channel to apply super equalizer.', ephemeral: true });
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
            if (!player) {
                await interaction.reply({ content: '❌ Nothing is currently playing.', ephemeral: true });
                return;
            }
            if (player.voiceId !== voiceChannel.id) {
                await interaction.reply({ content: '❌ You need to be in the same voice channel as the bot.', ephemeral: true });
                return;
            }
            await player.setFilters('superequalizer');
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.music} Super Equalizer Applied`)
                .setColor(COLORS.success)
                .addFields([
                { name: 'Applied by', value: interaction.user.tag, inline: true },
            ])
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }
        catch (error) {
            await interaction.reply({ content: '❌ Failed to apply super equalizer.', ephemeral: true });
        }
    }
    async executePrefix(message) {
        if (!message.guild || !message.member)
            return;
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            await message.reply('❌ You need to be in a voice channel to apply super equalizer.');
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
            if (!player) {
                await message.reply('❌ Nothing is currently playing.');
                return;
            }
            if (player.voiceId !== voiceChannel.id) {
                await message.reply('❌ You need to be in the same voice channel as the bot.');
                return;
            }
            await player.setFilters('superequalizer');
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.music} Super Equalizer Applied`)
                .setColor(COLORS.success)
                .addFields([
                { name: 'Applied by', value: message.author.tag, inline: true },
            ])
                .setTimestamp();
            await message.reply({ embeds: [embed] });
        }
        catch (error) {
            await message.reply('❌ Failed to apply super equalizer.');
        }
    }
}
export default SuperEqualizerCommand;
