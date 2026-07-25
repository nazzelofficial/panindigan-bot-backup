import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';
import getRedisClient from '../../database/redis/client';

export class RedisflushCommand extends BaseCommand {
  constructor() {
    super({
      name: 'redisflush',
      description: 'Flush all Redis keys (requires "confirm" argument)',
      category: 'owner',
      premiumTier: 'free',
      cooldown: 0,
      guildOnly: false,
      ownerOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['rflush'],
      examples: ['p!redisflush confirm'],
    } as CommandOptions);
  }

  private async run(interaction: ChatInputCommandInteraction | null, message: Message | null, confirm: string): Promise<void> {
    const send = async (e: EmbedBuilder) => {
      if (interaction) await interaction.reply({ embeds: [e], flags: 64 });
      else await message!.reply({ embeds: [e] });
    };
    if (confirm !== 'confirm') {
      return send(new EmbedBuilder().setColor(0xFF0000).setTitle('⚠️ DANGEROUS')
        .setDescription('This will delete **ALL Redis keys**.\n\nTo confirm, run: `redisflush confirm`'));
    }
    try {
      const redis = getRedisClient();
      await redis.flushAll();
      await send(new EmbedBuilder().setColor(COLORS.success).setTitle('✅ Redis Flushed').setDescription('All Redis keys have been deleted.'));
    } catch (err: any) {
      await send(new EmbedBuilder().setColor(COLORS.error).setTitle('❌ Error').setDescription(`\`\`\`${err.message}\`\`\``));
    }
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await this.run(interaction, null, interaction.options.getString('confirm') ?? '');
  }
  public async executePrefix(message: Message, args: string[]): Promise<void> {
    await this.run(null, message, args[0] ?? '');
  }
}
export default RedisflushCommand;
