// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getRedisClient } from '../../database/redis/client.js';
export class NoCooldownCommand extends BaseCommand {
    constructor() {
        super({ name: 'nocooldown', description: 'Clear all your active cooldowns (Diamond perk)', category: 'premium', premiumTier: 'diamond', cooldown: 300, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['clearcooldowns', 'resetcooldowns'], examples: ['/nocooldown'] });
    }
    async executeSlash(i) {
        const redis = getRedisClient();
        let cleared = 0;
        if (redis) {
            const keys = await redis.keys(`cooldown:${i.user.id}:*`);
            if (keys.length) {
                await redis.del(...keys);
                cleared = keys.length;
            }
        }
        const embed = new EmbedBuilder().setTitle('⚡ Cooldowns Cleared').setColor(COLORS.diamond)
            .setDescription(`Cleared **${cleared}** active cooldown(s). You can now use commands freely!`)
            .setFooter({ text: 'Diamond Premium Perk — This command has a 5-minute cooldown' });
        await i.reply({ embeds: [embed], ephemeral: true });
    }
    async executePrefix(m) {
        const redis = getRedisClient();
        let cleared = 0;
        if (redis) {
            const keys = await redis.keys(`cooldown:${m.author.id}:*`);
            if (keys.length) {
                await redis.del(...keys);
                cleared = keys.length;
            }
        }
        await m.reply(`⚡ Cleared **${cleared}** cooldowns!`);
    }
}
export default NoCooldownCommand;
