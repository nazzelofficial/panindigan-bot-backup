// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getRedisClient } from '../../database/redis/client.js';
export class RedisinfoCommand extends BaseCommand {
    constructor() {
        super({
            name: 'redisinfo',
            description: 'Show Redis server info (version, uptime, clients, memory)',
            category: 'owner',
            premiumTier: 'free',
            cooldown: 0,
            guildOnly: false,
            ownerOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['rinfo'],
            examples: ['p!redisinfo'],
        });
    }
    async run(interaction, message) {
        const send = async (e) => {
            if (interaction)
                await interaction.reply({ embeds: [e], flags: 64 });
            else
                await message.reply({ embeds: [e] });
        };
        try {
            const redis = getRedisClient();
            const info = await redis.info('server');
            const memInfo = await redis.info('memory');
            const get = (src, key) => src.match(new RegExp(`${key}:(.+)`))?.[1]?.trim() ?? 'N/A';
            const embed = new EmbedBuilder().setColor(COLORS.default).setTitle('📡 Redis Server Info')
                .addFields({ name: '🔢 Version', value: get(info, 'redis_version'), inline: true }, { name: '⏱️ Uptime', value: `${Math.floor(parseInt(get(info, 'uptime_in_seconds')) / 3600)}h`, inline: true }, { name: '🔌 Mode', value: get(info, 'redis_mode'), inline: true }, { name: '💾 Used Memory', value: get(memInfo, 'used_memory_human'), inline: true }, { name: '📈 Peak Memory', value: get(memInfo, 'used_memory_peak_human'), inline: true }, { name: '🏠 OS', value: get(info, 'os'), inline: false });
            await send(embed);
        }
        catch (err) {
            await send(new EmbedBuilder().setColor(COLORS.error).setTitle('❌ Error').setDescription(`\`\`\`${err.message}\`\`\``));
        }
    }
    async executeSlash(interaction) { await this.run(interaction, null); }
    async executePrefix(message) { await this.run(null, message); }
}
export default RedisinfoCommand;
