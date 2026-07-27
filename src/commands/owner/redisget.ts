// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import getRedisClient from '../../database/redis/client.js';

export class RedisgetCommand extends BaseCommand {
  constructor() {
    super({
      name: 'redisget',
      description: 'Get a Redis value by key',
      category: 'owner',
      premiumTier: 'free',
      cooldown: 0,
      guildOnly: false,
      ownerOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['rget'],
      examples: ['p!redisget maintenance:enabled'],
    } as CommandOptions);
  }

  private async run(interaction: ChatInputCommandInteraction | null, message: Message | null, key: string): Promise<void> {
    const send = async (e: EmbedBuilder) => {
      if (interaction) await interaction.reply({ embeds: [e], flags: 64 });
      else await message!.reply({ embeds: [e] });
    };
    if (!key) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Provide a key name.'));
    try {
      const redis = getRedisClient();
      const value = await redis.get(key);
      const ttl = await redis.ttl(key);
      const embed = new EmbedBuilder()
        .setColor(value !== null ? COLORS.success : COLORS.error)
        .setTitle(`🔑 Redis Key: ${key}`)
        .addFields(
          { name: 'Value', value: value !== null ? `\`\`\`${String(value).slice(0, 900)}\`\`\`` : '*(null / not found)*', inline: false },
          { name: 'TTL', value: ttl === -1 ? 'No expiry' : ttl === -2 ? 'Key not found' : `${ttl}s`, inline: true }
        );
      await send(embed);
    } catch (err: any) {
      await send(new EmbedBuilder().setColor(COLORS.error).setTitle('❌ Error').setDescription(`\`\`\`${err.message}\`\`\``));
    }
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await this.run(interaction, null, interaction.options.getString('key', true));
  }
  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    await this.run(null, message, args[0]);
  }
}
export default RedisgetCommand;
