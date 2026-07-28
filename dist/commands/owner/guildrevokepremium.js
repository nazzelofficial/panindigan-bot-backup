// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class GuildrevokepremiumCommand extends BaseCommand {
    constructor() {
        super({ name: 'guildrevokepremium', description: 'Revoke premium from a guild', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['grp'], examples: ['p!guildrevokepremium 123456789'] });
    }
    async run(i, m, guildId) {
        const send = async (e) => { if (i)
            await i.reply({ embeds: [e], flags: 64 });
        else
            await m.reply({ embeds: [e] }); };
        if (!guildId)
            return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Provide a guild ID.'));
        try {
            const prisma = getPrismaClient();
            await prisma.guild.update({ where: { id: guildId }, data: { premiumTier: 'free', premiumUntil: null } }).catch(() => null);
            await send(new EmbedBuilder().setColor(COLORS.success).setTitle('💎 Premium Revoked').setDescription(`Premium has been removed from guild \`${guildId}\`.`));
        }
        catch (err) {
            await send(new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ ${err.message}`));
        }
    }
    async executeSlash(i) { await this.run(i, null, i.options.getString('guild_id', true)); }
    async executePrefix(m, _args) { await this.run(null, m, args[0]); }
}
export default GuildrevokepremiumCommand;
