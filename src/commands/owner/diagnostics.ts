import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';
import os from 'os';

export class DiagnosticsCommand extends BaseCommand {
  constructor() {
    super({ name: 'diagnostics', description: 'Comprehensive bot diagnostics report', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['diag'], examples: ['p!diagnostics'] } as CommandOptions);
  }
  private async run(i: ChatInputCommandInteraction | null, m: Message | null): Promise<void> {
    const client = i?.client ?? m!.client;
    const send = async (e: EmbedBuilder) => { if (i) await i.reply({ embeds: [e], flags: 64 }); else await m!.reply({ embeds: [e] }); };
    const mem = process.memoryUsage();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const uptime = process.uptime();
    const d = Math.floor(uptime / 86400), h = Math.floor((uptime % 86400) / 3600), mn = Math.floor((uptime % 3600) / 60);
    const embed = new EmbedBuilder().setColor(COLORS.default).setTitle('🔬 Bot Diagnostics')
      .addFields(
        { name: '🤖 Bot', value: `${client.user?.tag ?? 'Unknown'}\nID: ${client.user?.id ?? 'N/A'}`, inline: true },
        { name: '⏱️ Uptime', value: `${d}d ${h}h ${mn}m`, inline: true },
        { name: '📡 WS Ping', value: `${client.ws.ping}ms`, inline: true },
        { name: '🏠 Guilds', value: client.guilds.cache.size.toLocaleString(), inline: true },
        { name: '👥 Cached Users', value: client.users.cache.size.toLocaleString(), inline: true },
        { name: '🔧 Shards', value: (client.shard?.count ?? 1).toString(), inline: true },
        { name: '💾 Heap Used', value: `${(mem.heapUsed / 1024 / 1024).toFixed(1)} MB`, inline: true },
        { name: '💽 RSS', value: `${(mem.rss / 1024 / 1024).toFixed(1)} MB`, inline: true },
        { name: '🖥️ OS RAM', value: `${((totalMem - freeMem) / 1024 / 1024 / 1024).toFixed(1)}/${(totalMem / 1024 / 1024 / 1024).toFixed(1)} GB`, inline: true },
        { name: '🟢 Node', value: process.version, inline: true },
        { name: '🏗️ CPU Cores', value: os.cpus().length.toString(), inline: true },
        { name: '💻 Platform', value: `${os.platform()} ${os.arch()}`, inline: true },
      ).setTimestamp();
    await send(embed);
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> { await this.run(i, null); }
  public async executePrefix(m: Message): Promise<void> { await this.run(null, m); }
}
export default DiagnosticsCommand;
