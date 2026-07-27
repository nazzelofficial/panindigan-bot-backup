// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import getRedisClient from '../../database/redis/client.js';
export class RedisflushCommand extends BaseCommand {
    constructor() {
        super({
            name: 'redisflush',
            description: 'Flush all Redis keys (requires "confirm" argument)',
            category: 'owner',
            premiumTier: 'free',
            cooldown: 0,
            guildOnly: false,
            ownerOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['rflush'],
            examples: ['p!redisflush confirm'],
        });
    }
    async run(interaction, message, confirm) {
        const send = async (e) => {
            if (interaction)
                await interaction.reply({ embeds: [e], flags: 64 });
            else
                await message.reply({ embeds: [e] });
        };
        if (confirm !== 'confirm') {
            return send(new EmbedBuilder().setColor(0xFF0000).setTitle('⚠️ DANGEROUS')
                .setDescription('This will delete **ALL Redis keys**.\n\nTo confirm, run: `redisflush confirm`'));
        }
        try {
            const redis = getRedisClient();
            await redis.flushAll();
            await send(new EmbedBuilder().setColor(COLORS.success).setTitle('✅ Redis Flushed').setDescription('All Redis keys have been deleted.'));
        }
        catch (err) {
            await send(new EmbedBuilder().setColor(COLORS.error).setTitle('❌ Error').setDescription(`\`\`\`${err.message}\`\`\``));
        }
    }
    async executeSlash(interaction) {
        await this.run(interaction, null, interaction.options.getString('confirm') ?? '');
    }
    async executePrefix(message, _args) {
        await this.run(null, message, args[0] ?? '');
    }
}
export default RedisflushCommand;
