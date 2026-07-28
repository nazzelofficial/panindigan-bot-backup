// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class AutoplayCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'autoplay',
            description: 'Toggle autoplay mode (adds similar songs automatically)',
            category: 'music',
            cooldown: 5,
            userPermissions: [PermissionFlagsBits.Connect],
            botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['auto', 'ap'],
            examples: ['/autoplay', 'p!autoplay'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        if (!interaction.guild || !interaction.member)
            return;
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            await interaction.reply({ content: '❌ You need to be in a voice channel to toggle autoplay.', ephemeral: true });
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
            const newState = player.data.set("autoplay", !player.data.get("autoplay"));
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.music} Autoplay ${newState ? 'Enabled' : 'Disabled'}`)
                .setColor(newState ? COLORS.success : COLORS.warning)
                .addFields([
                { name: 'Status', value: newState ? '🔊 Enabled' : '🔇 Disabled', inline: true },
                { name: 'Toggled by', value: interaction.user.tag, inline: true },
            ])
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }
        catch (error) {
            await interaction.reply({ content: '❌ Failed to toggle autoplay.', ephemeral: true });
        }
    }
    async executePrefix(message) {
        if (!message.guild || !message.member)
            return;
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            await message.reply('❌ You need to be in a voice channel to toggle autoplay.');
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
            const newState = player.data.set("autoplay", !player.data.get("autoplay"));
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.music} Autoplay ${newState ? 'Enabled' : 'Disabled'}`)
                .setColor(newState ? COLORS.success : COLORS.warning)
                .addFields([
                { name: 'Status', value: newState ? '🔊 Enabled' : '🔇 Disabled', inline: true },
                { name: 'Toggled by', value: message.author.tag, inline: true },
            ])
                .setTimestamp();
            await message.reply({ embeds: [embed] });
        }
        catch (error) {
            await message.reply('❌ Failed to toggle autoplay.');
        }
    }
}
export default AutoplayCommand;
