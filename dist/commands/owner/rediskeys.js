// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getRedisClient } from '../../database/redis/client.js';
export class RediskeysCommand extends BaseCommand {
    constructor() {
        super({
            name: 'rediskeys',
            description: 'List Redis keys matching a pattern',
            category: 'owner',
            premiumTier: 'free',
            cooldown: 0,
            guildOnly: false,
            ownerOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['rkeys'],
            examples: ['p!rediskeys maintenance:*', 'p!rediskeys *'],
        });
    }
    async run(interaction, message, pattern) {
        const send = async (e) => {
            if (interaction)
                await interaction.reply({ embeds: [e], flags: 64 });
            else
                await message.reply({ embeds: [e] });
        };
        try {
            const redis = getRedisClient();
            const keys = await redis.keys(pattern || '*');
            const limited = keys.slice(0, 25);
            const embed = new EmbedBuilder().setColor(COLORS.default).setTitle(`🔑 Redis Keys: \`${pattern || '*'}\``)
                .setDescription(limited.length ? limited.map(k => `\`${k}\``).join('\n') : 'No keys found.')
                .setFooter({ text: `Showing ${limited.length} of ${keys.length} keys` });
            await send(embed);
        }
        catch (err) {
            await send(new EmbedBuilder().setColor(COLORS.error).setTitle('❌ Error').setDescription(`\`\`\`${err.message}\`\`\``));
        }
    }
    async executeSlash(interaction) {
        await this.run(interaction, null, interaction.options.getString('pattern') ?? '*');
    }
    async executePrefix(message, _args) {
        await this.run(null, message, args[0] ?? '*');
    }
}
export default RediskeysCommand;
