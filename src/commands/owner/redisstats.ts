// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import getRedisClient from '../../database/redis/client.js';

export class RedisstatsCommand extends BaseCommand {
  constructor() {
    super({
      name: 'redisstats',
      description: 'Show Redis server statistics',
      category: 'owner',
      premiumTier: 'free',
      cooldown: 0,
      guildOnly: false,
      ownerOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['rs'],
      examples: ['p!redisstats'],
    } as CommandOptions);
  }

  private async run(interaction: ChatInputCommandInteraction | null, message: Message | null): Promise<void> {
    const send = async (e: EmbedBuilder) => {
      if (interaction) await interaction.reply({ embeds: [e], flags: 64 });
      else await message!.reply({ embeds: [e] });
    };
    try {
      const redis = getRedisClient();
      const info: string = await redis.info();
      const get = (key: string) => info.match(new RegExp(`${key}:(.+)`))?.[1]?.trim() ?? 'N/A';
      const embed = new EmbedBuilder()
        .setColor(COLORS.default)
        .setTitle('📊 Redis Statistics')
        .addFields(
          { name: '🖥️ Version', value: get('redis_version'), inline: true },
          { name: '⏱️ Uptime', value: `${get('uptime_in_seconds')}s`, inline: true },
          { name: '🔌 Clients', value: get('connected_clients'), inline: true },
          { name: '💾 Memory Used', value: get('used_memory_human'), inline: true },
          { name: '✅ Cache Hits', value: get('keyspace_hits'), inline: true },
          { name: '❌ Cache Misses', value: get('keyspace_misses'), inline: true },
          { name: '🔑 Total Keys', value: get('db0')?.match(/keys=(\d+)/)?.[1] ?? '0', inline: true },
          { name: '📤 Total Commands', value: get('total_commands_processed'), inline: true },
        );
      await send(embed);
    } catch (err: any) {
      await send(new EmbedBuilder().setColor(COLORS.error).setTitle('❌ Redis Error').setDescription(`\`\`\`${err.message}\`\`\``));
    }
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> { await this.run(interaction, null); }
  public async executePrefix(message: Message): Promise<void> { await this.run(null, message); }
}
export default RedisstatsCommand;
