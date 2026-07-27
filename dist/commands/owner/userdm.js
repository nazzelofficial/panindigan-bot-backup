// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
export class UserdmCommand extends BaseCommand {
    constructor() {
        super({ name: 'userdm', description: 'Send a DM to any user by ID', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['udm'], examples: ['p!userdm 123456789 Hello from the bot owner!'] });
    }
    async run(i, m, userId, msg) {
        const client = i?.client ?? m.client;
        const send = async (e) => { if (i)
            await i.reply({ embeds: [e], flags: 64 });
        else
            await m.reply({ embeds: [e] }); };
        if (!userId || !msg)
            return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Usage: `userdm <user_id> <message>`'));
        try {
            const user = await client.users.fetch(userId);
            await user.send({ embeds: [new EmbedBuilder().setColor(COLORS.default).setTitle('📨 Message from Bot Owner').setDescription(msg).setTimestamp()] });
            await send(new EmbedBuilder().setColor(COLORS.success).setTitle('✅ DM Sent')
                .addFields({ name: 'To', value: `${user.tag} (\`${userId}\`)`, inline: true }, { name: 'Message', value: msg.slice(0, 200), inline: false }));
        }
        catch (err) {
            await send(new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ Could not DM user: ${err.message}`));
        }
    }
    async executeSlash(i) { await this.run(i, null, i.options.getString('user_id', true), i.options.getString('message', true)); }
    async executePrefix(m, _args) { await this.run(null, m, args[0], args.slice(1).join(' ')); }
}
export default UserdmCommand;
