import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';
import { PanindiganClient } from '../../structures/PanindiganClient';
import { getPrismaClient } from '../../database/postgresql/client';
import os from 'os';

export class StatsCommand extends BaseCommand {
  constructor() {
    super({ name: 'stats', description: 'View detailed bot statistics (Owner only)', category: 'owner', premiumTier: 'free', cooldown: 5, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['botstats', 'status', 'botinfo'], examples: ['/stats', 'p!stats'] } as CommandOptions);
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    await i.editReply({ embeds: [await this.buildEmbed(i.client as PanindiganClient)] });
  }

  public async executePrefix(m: Message): Promise<void> {
    await m.reply({ embeds: [await this.buildEmbed(m.client as PanindiganClient)] });
  }

  private async buildEmbed(client: PanindiganClient): Promise<EmbedBuilder> {
    const prisma = getPrismaClient();
    const [guildCount, userCount, commandCount] = await Promise.all([
      prisma.guild.count(),
      prisma.user.count(),
      prisma.commandLog?.count?.() ?? Promise.resolve(0),
    ]);

    const memUsage = process.memoryUsage();
    const uptime = process.uptime();
    const uptimeStr = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`;

    return new EmbedBuilder()
      .setTitle('📊 Bot Statistics')
      .setColor(COLORS.info)
      .addFields(
        { name: '🌐 Servers', value: `${client.guilds.cache.size} (${guildCount} in DB)`, inline: true },
        { name: '👥 Users (DB)', value: `${userCount}`, inline: true },
        { name: '📝 Commands Ran', value: `${commandCount}`, inline: true },
        { name: '🤖 Cached Users', value: `${client.users.cache.size}`, inline: true },
        { name: '🏓 Ping', value: `${client.ws.ping}ms`, inline: true },
        { name: '⏰ Uptime', value: uptimeStr, inline: true },
        { name: '💾 RAM Usage', value: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB / ${Math.round(os.totalmem() / 1024 / 1024)}MB`, inline: true },
        { name: '🖥️ CPU', value: `${os.cpus()[0]?.model || 'Unknown'}`, inline: true },
        { name: '🔧 Node.js', value: `${process.version}`, inline: true },
        { name: '📦 Commands', value: `${client.commands?.size || 0} loaded`, inline: true },
      )
      .setTimestamp();
  }
}
export default StatsCommand;
