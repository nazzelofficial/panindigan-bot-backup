// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import getMongoClient from '../../database/mongodb/client.js';
export class AutorespondCommand extends BaseCommand {
    constructor() {
        super({ name: 'autorespond', description: 'Auto-response triggers — add, list, delete', category: 'utility', premiumTier: 'diamond', cooldown: 3, guildOnly: true, ownerOnly: false, slashCommand: true, prefixCommand: true, aliases: ['ar', 'autoresponse'], examples: ['/autorespond add hello Hi there!', 'p!autorespond list'] });
    }
    async run(i, m, sub, trigger, response) {
        const guildId = i?.guildId ?? m?.guildId;
        if (!guildId)
            return;
        const send = async (e) => { if (i)
            await i.reply({ embeds: [e] });
        else
            await m.reply({ embeds: [e] }); };
        const db = await getMongoClient();
        const col = db.collection('auto_responses');
        if (sub === 'add' || sub === 'create') {
            if (!trigger || !response)
                return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Provide both trigger and response.'));
            const count = await col.countDocuments({ guildId });
            if (count >= 50)
                return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Maximum 50 auto-responses per server.'));
            await col.updateOne({ guildId, trigger: trigger.toLowerCase() }, { $set: { guildId, trigger: trigger.toLowerCase(), response, authorId: i?.user.id ?? m.author.id, updatedAt: new Date() } }, { upsert: true });
            await send(new EmbedBuilder().setColor(COLORS.success).setTitle('✅ Auto-Response Added').addFields({ name: 'Trigger', value: `\`${trigger}\``, inline: true }, { name: 'Response', value: response.slice(0, 200), inline: false }));
        }
        else if (sub === 'delete' || sub === 'remove') {
            if (!trigger)
                return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Provide a trigger to remove.'));
            const result = await col.deleteOne({ guildId, trigger: trigger.toLowerCase() });
            await send(new EmbedBuilder().setColor(result.deletedCount ? COLORS.success : COLORS.error)
                .setTitle(result.deletedCount ? '🗑️ Trigger Removed' : '❌ Not Found').setDescription(result.deletedCount ? `Trigger \`${trigger}\` removed.` : `Trigger \`${trigger}\` not found.`));
        }
        else {
            const triggers = await col.find({ guildId }).sort({ trigger: 1 }).toArray();
            const embed = new EmbedBuilder().setColor(COLORS.default).setTitle('⚡ Auto-Responses')
                .setDescription(triggers.length ? triggers.map(t => `• \`${t.trigger}\` → ${t.response.slice(0, 50)}`).join('\n') : 'No auto-responses configured.')
                .setFooter({ text: `${triggers.length}/50 triggers` });
            await send(embed);
        }
    }
    async executeSlash(i) {
        const sub = i.options.getSubcommand(false) ?? 'list';
        await this.run(i, null, sub, i.options.getString('trigger') ?? '', i.options.getString('response') ?? '');
    }
    async executePrefix(m, _args) { await this.run(null, m, args[0] ?? 'list', args[1] ?? '', _args.slice(2).join(' ')); }
}
export default AutorespondCommand;
