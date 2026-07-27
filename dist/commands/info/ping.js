// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class PingCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'ping',
            description: 'Display the bot latency',
            category: 'info',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['latency', 'pong'],
            examples: ['/ping', 'p!ping'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
        const apiLatency = sent.createdTimestamp - interaction.createdTimestamp;
        const wsLatency = interaction.client.ws.ping;
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.info} 🏓 Pong!`)
            .setColor(COLORS.info)
            .addFields([
            { name: 'API Latency', value: `${apiLatency}ms`, inline: true },
            { name: 'WebSocket Latency', value: `${wsLatency}ms`, inline: true },
        ])
            .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
    }
    async executePrefix(message) {
        const sent = await message.reply({ content: 'Pinging...' });
        const apiLatency = sent.createdTimestamp - message.createdTimestamp;
        const wsLatency = message.client.ws.ping;
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.info} 🏓 Pong!`)
            .setColor(COLORS.info)
            .addFields([
            { name: 'API Latency', value: `${apiLatency}ms`, inline: true },
            { name: 'WebSocket Latency', value: `${wsLatency}ms`, inline: true },
        ])
            .setTimestamp();
        await sent.edit({ embeds: [embed] });
    }
}
export default PingCommand;
