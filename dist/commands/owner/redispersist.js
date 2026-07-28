// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getRedisClient } from '../../database/redis/client.js';
export class RedispersistCommand extends BaseCommand {
    constructor() {
        super({
            name: 'redispersist',
            description: 'Remove expiry (TTL) from a Redis key to make it persistent',
            category: 'owner',
            premiumTier: 'free',
            cooldown: 0,
            guildOnly: false,
            ownerOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['rpersist'],
            examples: ['p!redispersist maintenance:enabled'],
        });
    }
    async run(interaction, message, key) {
        const send = async (e) => {
            if (interaction)
                await interaction.reply({ embeds: [e], flags: 64 });
            else
                await message.reply({ embeds: [e] });
        };
        if (!key)
            return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Provide a key name.'));
        try {
            const redis = getRedisClient();
            const result = await redis.persist(key);
            const embed = new EmbedBuilder()
                .setColor(result ? COLORS.success : COLORS.error)
                .setTitle(`♾️ Redis PERSIST: \`${key}\``)
                .setDescription(result ? '✅ TTL removed. Key is now persistent.' : '❌ Key not found or had no TTL.');
            await send(embed);
        }
        catch (err) {
            await send(new EmbedBuilder().setColor(COLORS.error).setTitle('❌ Error').setDescription(`\`\`\`${err.message}\`\`\``));
        }
    }
    async executeSlash(interaction) {
        await this.run(interaction, null, interaction.options.getString('key', true));
    }
    async executePrefix(message, _args) {
        await this.run(null, message, args[0]);
    }
}
export default RedispersistCommand;
