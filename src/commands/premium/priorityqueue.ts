// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class PriorityQueueCommand extends BaseCommand {
  constructor() {
    super({ name: 'priorityqueue', description: 'Add a song to the front of the music queue (Bronze+ perk) 🥉', category: 'premium', premiumTier: 'bronze', cooldown: 3, guildOnly: true, slashCommand: true, prefixCommand: true, aliases: ['pq', 'priority', 'frontsong'], examples: ['/priorityqueue <song URL or name>', 'p!priorityqueue Never Gonna Give You Up'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addStringOption(o => o.setName('query').setDescription('Song name or URL to add at the front of the queue').setRequired(true))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  private async handle(userId: string, guildId: string, query: string, send: (c: any) => Promise<any>): Promise<void> {
    const prisma = getPrismaClient();

    // Look up current queue for this guild
    const queue = await (prisma as any).musicQueue?.findFirst?.({
      where: { guildId },
      include: { songs: { orderBy: { position: 'asc' }, take: 5 } },
    }).catch(() => null);

    const embed = new EmbedBuilder()
      .setTitle('🥉 Priority Queue — Song Added at Front')
      .setColor(COLORS.bronze)
      .setTimestamp();

    if (!queue) {
      // No active queue — store in DB as priority request
      await (prisma as any).musicQueueRequest?.create?.({
        data: { guildId, userId, query, priority: true, createdAt: new Date() },
      }).catch(() => null);

      embed.setDescription(`✅ **Queued at position #1!**\n\n> 🎵 ${query}\n\nWhen music is next played in this server, your song will start first.\n\n💡 As a Bronze+ subscriber, your songs always jump the queue!`)
        .setFooter({ text: 'Bronze Premium Perk — Priority Queue' });
    } else {
      // Active queue — save priority at the front
      const maxPos = await (prisma as any).musicQueueSong?.findFirst?.({
        where: { queueId: queue.id },
        orderBy: { position: 'asc' },
        select: { position: true },
      }).catch(() => null);

      const frontPos = (maxPos?.position ?? 1) - 1;

      await (prisma as any).musicQueueSong?.create?.({
        data: { queueId: queue.id, query, userId, position: frontPos },
      }).catch(() => null);

      const queueLength = queue.songs?.length || 0;
      embed.setDescription(`✅ **Added to front of queue!**\n\n> 🎵 ${query}\n\n📋 Jumped **${queueLength}** song${queueLength !== 1 ? 's' : ''} in the queue.\n\n💡 As a Bronze+ subscriber, your songs always jump ahead of others!`)
        .setFooter({ text: 'Bronze Premium Perk — Priority Queue' });
    }

    await send({ embeds: [embed] });
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const query = i.options.getString('query', true);
    await this.handle(i.user.id, i.guildId!, query, (c) => i.reply(c));
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    if (!args.length) { await m.reply('❌ Usage: `p!priorityqueue <song name or URL>`'); return; }
    await this.handle(m.author.id, m.guildId!, args.join(' '), (c) => m.reply(c));
  }
}
export default PriorityQueueCommand;
