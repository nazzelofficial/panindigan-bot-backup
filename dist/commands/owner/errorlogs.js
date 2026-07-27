// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import fs from 'fs';
import path from 'path';
export class ErrorlogsCommand extends BaseCommand {
    constructor() {
        super({ name: 'errorlogs', description: 'Read error log (last 30 lines)', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['errlogs', 'elogs'], examples: ['p!errorlogs'] });
    }
    async run(i, m) {
        const send = async (e) => { if (i)
            await i.reply({ embeds: [e], flags: 64 });
        else
            await m.reply({ embeds: [e] }); };
        const logPath = path.resolve('logs/error.log');
        if (!fs.existsSync(logPath))
            return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Error log not found at `logs/error.log`.'));
        const content = fs.readFileSync(logPath, 'utf8');
        const lines = content.split('\n').filter(l => l.trim()).slice(-30).join('\n').slice(-1800);
        const embed = new EmbedBuilder().setColor(COLORS.error).setTitle('🚨 Error Logs (Last 30)')
            .setDescription(`\`\`\`\n${lines || 'No errors found. 🎉'}\n\`\`\``);
        await send(embed);
    }
    async executeSlash(i) { await this.run(i, null); }
    async executePrefix(m) { await this.run(null, m); }
}
export default ErrorlogsCommand;
