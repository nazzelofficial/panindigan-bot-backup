// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import getRedisClient from '../../database/redis/client.js';
export class GuildunlockCommand extends BaseCommand {
    constructor() {
        super({ name: 'guildunlock', description: 'Unlock a guild from maintenance mode', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['gulk'], examples: ['p!guildunlock 123456789'] });
    }
    async run(i, m, guildId) {
        const send = async (e) => { if (i)
            await i.reply({ embeds: [e], flags: 64 });
        else
            await m.reply({ embeds: [e] }); };
        if (!guildId)
            return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Provide a guild ID.'));
        const redis = getRedisClient();
        await redis.del(`guild:locked:${guildId}`);
        await send(new EmbedBuilder().setColor(COLORS.success).setTitle('🔓 Guild Unlocked').setDescription(`Guild \`${guildId}\` is now unlocked and fully operational.`));
    }
    async executeSlash(i) { await this.run(i, null, i.options.getString('guild_id', true)); }
    async executePrefix(m, _args) { await this.run(null, m, args[0]); }
}
export default GuildunlockCommand;
