// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, ChannelType } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
export class GuildinviteCommand extends BaseCommand {
    constructor() {
        super({ name: 'guildinvite', description: 'Create an invite link for any guild', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['ginv'], examples: ['p!guildinvite 123456789'] });
    }
    async run(i, m, guildId) {
        const client = i?.client ?? m.client;
        const send = async (e) => { if (i)
            await i.reply({ embeds: [e], flags: 64 });
        else
            await m.reply({ embeds: [e] }); };
        if (!guildId)
            return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Provide a guild ID.'));
        const guild = client.guilds.cache.get(guildId);
        if (!guild)
            return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Bot is not in that guild.'));
        const channel = guild.channels.cache.find(c => c.type === ChannelType.GuildText && c.permissionsFor(guild.members.me)?.has('CreateInstantInvite'));
        if (!channel)
            return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ No suitable channel found to create invite.'));
        try {
            const invite = await channel.createInvite({ maxAge: 3600, maxUses: 1, reason: 'Owner invite' });
            await send(new EmbedBuilder().setColor(COLORS.success).setTitle(`🔗 Invite: ${guild.name}`)
                .addFields({ name: '🔗 Link', value: invite.url, inline: false }, { name: '⏱️ Expires', value: '1 hour', inline: true }, { name: '🎫 Max Uses', value: '1', inline: true }));
        }
        catch (err) {
            await send(new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ ${err.message}`));
        }
    }
    async executeSlash(i) { await this.run(i, null, i.options.getString('guild_id', true)); }
    async executePrefix(m, _args) { await this.run(null, m, args[0]); }
}
export default GuildinviteCommand;
