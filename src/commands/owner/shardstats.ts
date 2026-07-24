import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';

export class ShardStatsCommand extends BaseCommand {
  constructor() {
    super({
      name: 'shardstats',
      description: 'Memory, guilds, and ping per shard',
      category: 'owner',
      premiumTier: 'free',
      cooldown: 0,
      ownerOnly: true,
      guildOnly: false,
      slashCommand: false,
      prefixCommand: true,
      aliases: ['sshards'],
      examples: ['p!shardstats'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder().setName(this.name).setDescription(this.description).setDMPermission(false) as SlashCommandBuilder;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    await i.reply({ content: 'Use prefix command `p!shardstats` for this.', ephemeral: true });
  }

  public async executePrefix(m: Message): Promise<void> {
    try {
      const client = m.client as any;

      if (!client.shard) {
        const mem = process.memoryUsage();
        const embed = new EmbedBuilder()
          .setTitle('📊 Shard Stats (Unsharded)')
          .setColor(COLORS.default)
          .addFields(
            { name: 'Shard', value: '0', inline: true },
            { name: 'Guilds', value: `${client.guilds.cache.size}`, inline: true },
            { name: 'Ping', value: `${client.ws.ping}ms`, inline: true },
            { name: 'Heap Used', value: `${Math.round(mem.heapUsed / 1024 / 1024)}MB`, inline: true },
            { name: 'RSS', value: `${Math.round(mem.rss / 1024 / 1024)}MB`, inline: true },
          )
          .setTimestamp();
        await m.reply({ embeds: [embed] });
        return;
      }

      const results: { id: number; guilds: number; ping: number; heapUsed: number; rss: number }[] =
        await client.shard.broadcastEval((c: any) => {
          const mem = process.memoryUsage();
          return {
            id: c.shard?.ids[0] ?? 0,
            guilds: c.guilds.cache.size,
            ping: c.ws.ping,
            heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
            rss: Math.round(mem.rss / 1024 / 1024),
          };
        });

      const rows = results
        .sort((a, b) => a.id - b.id)
        .map(s =>
          `**Shard ${s.id}** — Guilds: ${s.guilds} | Ping: ${s.ping}ms | Heap: ${s.heapUsed}MB | RSS: ${s.rss}MB`
        )
        .join('\n');

      const totalGuilds = results.reduce((a, b) => a + b.guilds, 0);
      const totalHeap = results.reduce((a, b) => a + b.heapUsed, 0);

      const embed = new EmbedBuilder()
        .setTitle('📊 Shard Stats')
        .setColor(COLORS.default)
        .setDescription(rows || 'No data.')
        .addFields(
          { name: 'Total Shards', value: `${results.length}`, inline: true },
          { name: 'Total Guilds', value: `${totalGuilds}`, inline: true },
          { name: 'Total Heap', value: `${totalHeap}MB`, inline: true },
        )
        .setTimestamp();

      await m.reply({ embeds: [embed] });
    } catch (err: any) {
      await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ Error: ${err?.message}`)] });
    }
  }
}

export default ShardStatsCommand;
