// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
export class ShardPingCommand extends BaseCommand {
    constructor() {
        super({
            name: 'shardping',
            description: 'Shows WebSocket ping of each shard',
            category: 'owner',
            premiumTier: 'free',
            cooldown: 0,
            ownerOnly: true,
            guildOnly: false,
            slashCommand: false,
            prefixCommand: true,
            aliases: ['sping'],
            examples: ['p!shardping'],
        });
    }
    buildSlashCommand() {
        return new SlashCommandBuilder().setName(this.name).setDescription(this.description).setDMPermission(false);
    }
    async executeSlash(i) {
        await i.reply({ content: 'Use prefix command `p!shardping` for this.', ephemeral: true });
    }
    async executePrefix(m) {
        try {
            const client = m.client;
            if (!client.shard) {
                const embed = new EmbedBuilder()
                    .setTitle('🏓 Shard Ping (Unsharded)')
                    .setColor(COLORS.default)
                    .setDescription(`Shard **0** — \`${client.ws.ping}ms\``)
                    .setTimestamp();
                await m.reply({ embeds: [embed] });
                return;
            }
            const results = await client.shard.broadcastEval((c) => ({
                id: c.shard?.ids[0] ?? 0,
                ping: c.ws.ping,
            }));
            const rows = results
                .sort((a, b) => a.id - b.id)
                .map(s => {
                const bar = s.ping < 100 ? '🟢' : s.ping < 200 ? '🟡' : '🔴';
                return `${bar} Shard **${s.id}** — \`${s.ping}ms\``;
            })
                .join('\n');
            const avgPing = Math.round(results.reduce((a, b) => a + b.ping, 0) / results.length);
            const embed = new EmbedBuilder()
                .setTitle('🏓 Shard Ping')
                .setColor(COLORS.default)
                .setDescription(rows || 'No data.')
                .addFields({ name: 'Average Ping', value: `${avgPing}ms`, inline: true })
                .setTimestamp();
            await m.reply({ embeds: [embed] });
        }
        catch (err) {
            await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ Error: ${err?.message}`)] });
        }
    }
}
export default ShardPingCommand;
