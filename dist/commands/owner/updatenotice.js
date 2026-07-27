// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
export class UpdatenoticeCommand extends BaseCommand {
    constructor() {
        super({ name: 'updatenotice', description: 'Preview an update notice message', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['updn'], examples: ['p!updatenotice v2.0 - New music commands added!'] });
    }
    async run(i, m, msg) {
        const send = async (e) => { if (i)
            await i.reply({ embeds: [e], flags: 64 });
        else
            await m.reply({ embeds: [e] }); };
        if (!msg)
            return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Provide an update notice message.'));
        const embed = new EmbedBuilder().setColor(0x00BFFF).setTitle('📢 Update Notice — Preview')
            .setDescription(msg).setFooter({ text: 'This is a preview. Use announce to send to all guilds.' }).setTimestamp();
        await send(embed);
    }
    async executeSlash(i) { await this.run(i, null, i.options.getString('message', true)); }
    async executePrefix(m, _args) { await this.run(null, m, args.join(' ')); }
}
export default UpdatenoticeCommand;
