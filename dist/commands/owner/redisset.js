// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getRedisClient } from '../../database/redis/client.js';
export class RedissetCommand extends BaseCommand {
    constructor() {
        super({
            name: 'redisset',
            description: 'Set a Redis key with optional TTL',
            category: 'owner',
            premiumTier: 'free',
            cooldown: 0,
            guildOnly: false,
            ownerOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['rset'],
            examples: ['p!redisset maintenance:enabled true 3600'],
        });
    }
    async run(interaction, message, key, value, ttl) {
        const send = async (e) => {
            if (interaction)
                await interaction.reply({ embeds: [e], flags: 64 });
            else
                await message.reply({ embeds: [e] });
        };
        if (!key || value === undefined)
            return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Usage: `redisset <key> <value> [ttl_seconds]`'));
        try {
            const redis = getRedisClient();
            if (ttl && ttl > 0) {
                await redis.set(key, value, { EX: ttl });
            }
            else {
                await redis.set(key, value);
            }
            const embed = new EmbedBuilder().setColor(COLORS.success).setTitle('✅ Redis Key Set')
                .addFields({ name: 'Key', value: `\`${key}\``, inline: true }, { name: 'Value', value: `\`${String(value).slice(0, 200)}\``, inline: true }, { name: 'TTL', value: ttl ? `${ttl}s` : 'No expiry', inline: true });
            await send(embed);
        }
        catch (err) {
            await send(new EmbedBuilder().setColor(COLORS.error).setTitle('❌ Error').setDescription(`\`\`\`${err.message}\`\`\``));
        }
    }
    async executeSlash(interaction) {
        await this.run(interaction, null, interaction.options.getString('key', true), interaction.options.getString('value', true), interaction.options.getInteger('ttl') ?? undefined);
    }
    async executePrefix(message, _args) {
        await this.run(null, message, args[0], args[1], args[2] ? parseInt(args[2]) : undefined);
    }
}
export default RedissetCommand;
