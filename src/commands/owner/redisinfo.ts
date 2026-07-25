import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';
import getRedisClient from '../../database/redis/client';

export class RedisinfoCommand extends BaseCommand {
  constructor() {
    super({
      name: 'redisinfo',
      description: 'Show Redis server info (version, uptime, clients, memory)',
      category: 'owner',
      premiumTier: 'free',
      cooldown: 0,
      guildOnly: false,
      ownerOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['rinfo'],
      examples: ['p!redisinfo'],
    } as CommandOptions);
  }

  private async run(interaction: ChatInputCommandInteraction | null, message: Message | null): Promise<void> {
    const send = async (e: EmbedBuilder) => {
      if (interaction) await interaction.reply({ embeds: [e], flags: 64 });
      else await message!.reply({ embeds: [e] });
    };
    try {
      const redis = getRedisClient();
      const info: string = await redis.info('server');
      const memInfo: string = await redis.info('memory');
      const get = (src: string, key: string) => src.match(new RegExp(`${key}:(.+)`))?.[1]?.trim() ?? 'N/A';
      const embed = new EmbedBuilder().setColor(COLORS.default).setTitle('📡 Redis Server Info')
        .addFields(
          { name: '🔢 Version', value: get(info, 'redis_version'), inline: true },
          { name: '⏱️ Uptime', value: `${Math.floor(parseInt(get(info, 'uptime_in_seconds')) / 3600)}h`, inline: true },
          { name: '🔌 Mode', value: get(info, 'redis_mode'), inline: true },
          { name: '💾 Used Memory', value: get(memInfo, 'used_memory_human'), inline: true },
          { name: '📈 Peak Memory', value: get(memInfo, 'used_memory_peak_human'), inline: true },
          { name: '🏠 OS', value: get(info, 'os'), inline: false },
        );
      await send(embed);
    } catch (err: any) {
      await send(new EmbedBuilder().setColor(COLORS.error).setTitle('❌ Error').setDescription(`\`\`\`${err.message}\`\`\``));
    }
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> { await this.run(interaction, null); }
  public async executePrefix(message: Message): Promise<void> { await this.run(null, message); }
}
export default RedisinfoCommand;
