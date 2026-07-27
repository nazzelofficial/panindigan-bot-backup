// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import fs from 'fs';
import path from 'path';
export class LogsCommand extends BaseCommand {
    constructor() {
        super({ name: 'logs', description: 'Read combined log file (last N lines, filter by level)', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['log'], examples: ['p!logs error 20', 'p!logs 30'] });
    }
    async run(i, m, level, lines) {
        const send = async (e) => { if (i)
            await i.reply({ embeds: [e], flags: 64 });
        else
            await m.reply({ embeds: [e] }); };
        const logPath = path.resolve('logs/combined.log');
        if (!fs.existsSync(logPath))
            return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Log file not found at `logs/combined.log`.'));
        const content = fs.readFileSync(logPath, 'utf8');
        let logLines = content.split('\n').filter(l => l.trim());
        if (level)
            logLines = logLines.filter(l => l.toLowerCase().includes(level.toLowerCase()));
        const last = logLines.slice(-lines).join('\n').slice(-1800);
        const embed = new EmbedBuilder().setColor(COLORS.default).setTitle(`📋 Logs${level ? ` [${level}]` : ''}`)
            .setDescription(`\`\`\`\n${last || 'No matching log entries.'}\n\`\`\``);
        await send(embed);
    }
    async executeSlash(i) {
        await this.run(i, null, i.options.getString('level') ?? '', i.options.getInteger('lines') ?? 20);
    }
    async executePrefix(m, _args) {
        const level = isNaN(parseInt(args[0])) ? (args[0] ?? '') : '';
        const lines = level ? parseInt(args[1]) || 20 : parseInt(args[0]) || 20;
        await this.run(null, m, level, lines);
    }
}
export default LogsCommand;
