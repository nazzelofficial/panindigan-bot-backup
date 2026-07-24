import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';

export class ShardPingCommand extends BaseCommand {
  constructor() {
    super({
      name: 'shardping',
      description: 'Shows WebSocket ping of each shard',
      category: 'owner',
      premiumTier: 'free',
      cooldown: 0,
      ownerOnly: true,
      guildOnly: false,
      slashCommand: false,
      prefixCommand: true,
      aliases: ['sping'],
      examples: ['p!shardping'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder().setName(this.name).setDescription(this.description).setDMPermission(false) as SlashCommandBuilder;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    await i.reply({ content: 'Use prefix command `p!shardping` for this.', ephemeral: true });
  }

  public async executePrefix(m: Message): Promise<void> {
    try {
      const client = m.client as any;

      if (!client.shard) {
        const embed = new EmbedBuilder()
          .setTitle('🏓 Shard Ping (Unsharded)')
          .setColor(COLORS.default)
          .setDescription(`Shard **0** — \`${client.ws.ping}ms\``)
          .setTimestamp();
        await m.reply({ embeds: [embed] });
        return;
      }

      const results: { id: number; ping: number }[] = await client.shard.broadcastEval((c: any) => ({
        id: c.shard?.ids[0] ?? 0,
        ping: c.ws.ping,
      }));

      const rows = results
        .sort((a, b) => a.id - b.id)
        .map(s => {
          const bar = s.ping < 100 ? '🟢' : s.ping < 200 ? '🟡' : '🔴';
          return `${bar} Shard **${s.id}** — \`${s.ping}ms\``;
        })
        .join('\n');

      const avgPing = Math.round(results.reduce((a, b) => a + b.ping, 0) / results.length);

      const embed = new EmbedBuilder()
        .setTitle('🏓 Shard Ping')
        .setColor(COLORS.default)
        .setDescription(rows || 'No data.')
        .addFields({ name: 'Average Ping', value: `${avgPing}ms`, inline: true })
        .setTimestamp();

      await m.reply({ embeds: [embed] });
    } catch (err: any) {
      await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ Error: ${err?.message}`)] });
    }
  }
}

export default ShardPingCommand;
