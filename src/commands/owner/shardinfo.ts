// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';

export class ShardInfoCommand extends BaseCommand {
  constructor() {
    super({
      name: 'shardinfo',
      description: 'Detailed status of all shards',
      category: 'owner',
      premiumTier: 'free',
      cooldown: 0,
      ownerOnly: true,
      guildOnly: false,
      slashCommand: false,
      prefixCommand: true,
      aliases: ['shards'],
      examples: ['p!shardinfo'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder().setName(this.name).setDescription(this.description).setDMPermission(false) as SlashCommandBuilder;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    await i.reply({ content: 'Use prefix command `p!shardinfo` for this.', ephemeral: true });
  }

  public async executePrefix(m: Message): Promise<void> {
    try {
      const client = m.client as any;

      if (!client.shard) {
        const embed = new EmbedBuilder()
          .setTitle('🔀 Shard Info')
          .setColor(COLORS.default)
          .setDescription('Bot is running without ShardingManager.')
          .addFields(
            { name: 'Shard ID', value: '0 (unsharded)', inline: true },
            { name: 'Guilds', value: `${client.guilds.cache.size}`, inline: true },
            { name: 'Ping', value: `${client.ws.ping}ms`, inline: true },
          )
          .setTimestamp();
        await m.reply({ embeds: [embed] });
        return;
      }

      const results: { id: number; guilds: number; ping: number }[] = await client.shard.broadcastEval((c: any) => ({
        id: c.shard?.ids[0] ?? 0,
        guilds: c.guilds.cache.size,
        ping: c.ws.ping,
      }));

      const rows = results
        .sort((a, b) => a.id - b.id)
        .map(s => `Shard **${s.id}** | Guilds: **${s.guilds}** | Ping: **${s.ping}ms**`)
        .join('\n');

      const totalGuilds = results.reduce((a, b) => a + b.guilds, 0);
      const avgPing = Math.round(results.reduce((a, b) => a + b.ping, 0) / results.length);

      const embed = new EmbedBuilder()
        .setTitle('🔀 Shard Info')
        .setColor(COLORS.default)
        .setDescription(rows || 'No shard data available.')
        .addFields(
          { name: 'Total Shards', value: `${results.length}`, inline: true },
          { name: 'Total Guilds', value: `${totalGuilds}`, inline: true },
          { name: 'Avg Ping', value: `${avgPing}ms`, inline: true },
        )
        .setTimestamp();

      await m.reply({ embeds: [embed] });
    } catch (err: any) {
      await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ Error: ${err?.message}`)] });
    }
  }
}

export default ShardInfoCommand;
