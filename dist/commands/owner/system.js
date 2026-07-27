// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import os from 'os';
export class SystemCommand extends BaseCommand {
    constructor() {
        super({ name: 'system', description: 'Show system resource usage (CPU, RAM, OS)', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['sys', 'sysinfo'], examples: ['p!system'] });
    }
    async run(i, m) {
        const send = async (e) => { if (i)
            await i.reply({ embeds: [e], flags: 64 });
        else
            await m.reply({ embeds: [e] }); };
        const cpus = os.cpus();
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const memPct = ((usedMem / totalMem) * 100).toFixed(1);
        const cpuLoad = cpus.reduce((acc, cpu) => {
            const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
            return acc + (1 - cpu.times.idle / total);
        }, 0) / cpus.length * 100;
        const uptime = os.uptime();
        const d = Math.floor(uptime / 86400), h = Math.floor((uptime % 86400) / 3600), mn = Math.floor((uptime % 3600) / 60);
        const embed = new EmbedBuilder().setColor(COLORS.default).setTitle('🖥️ System Information')
            .addFields({ name: '💻 OS', value: `${os.platform()} ${os.arch()} — ${os.version().slice(0, 40)}`, inline: false }, { name: '🔧 CPU', value: `${cpus[0].model} (${cpus.length} cores)\n**Load:** ${cpuLoad.toFixed(1)}%`, inline: true }, { name: '💾 RAM', value: `${(usedMem / 1024 / 1024 / 1024).toFixed(2)} GB / ${(totalMem / 1024 / 1024 / 1024).toFixed(2)} GB (${memPct}%)`, inline: true }, { name: '⏱️ OS Uptime', value: `${d}d ${h}h ${mn}m`, inline: true }, { name: '🟢 Node.js', value: process.version, inline: true }, { name: '📦 Process RAM', value: `${(process.memoryUsage().rss / 1024 / 1024).toFixed(1)} MB RSS`, inline: true });
        await send(embed);
    }
    async executeSlash(i) { await this.run(i, null); }
    async executePrefix(m) { await this.run(null, m); }
}
export default SystemCommand;
