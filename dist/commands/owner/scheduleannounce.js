// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import getMongoClient from '../../database/mongodb/client.js';
export class ScheduleannounceCommand extends BaseCommand {
    constructor() {
        super({ name: 'scheduleannounce', description: 'Schedule an announcement for a future time', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['sched'], examples: ['p!scheduleannounce 2025-01-01T00:00:00Z Happy New Year!'] });
    }
    async run(i, m, time, msg) {
        const send = async (e) => { if (i)
            await i.reply({ embeds: [e], flags: 64 });
        else
            await m.reply({ embeds: [e] }); };
        if (!time || !msg)
            return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Usage: `scheduleannounce <ISO_time> <message>`'));
        const date = new Date(time);
        if (isNaN(date.getTime()))
            return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Invalid time format. Use ISO 8601 (e.g. 2025-01-01T00:00:00Z)'));
        try {
            const db = await getMongoClient();
            await db.collection('scheduled_announces').insertOne({ message: msg, scheduledFor: date, createdAt: new Date(), status: 'pending' });
            await send(new EmbedBuilder().setColor(COLORS.success).setTitle('⏰ Announcement Scheduled')
                .addFields({ name: '📅 Time', value: date.toUTCString(), inline: false }, { name: '📝 Message', value: msg.slice(0, 500), inline: false }));
        }
        catch (err) {
            await send(new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ ${err.message}`));
        }
    }
    async executeSlash(i) { await this.run(i, null, i.options.getString('time', true), i.options.getString('message', true)); }
    async executePrefix(m, _args) { await this.run(null, m, args[0], args.slice(1).join(' ')); }
}
export default ScheduleannounceCommand;
