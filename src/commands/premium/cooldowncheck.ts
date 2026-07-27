// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getRedisClient } from '../../database/redis/client.js';

export class CooldownCheckCommand extends BaseCommand {
  constructor() {
    super({ name: 'cooldowncheck', description: 'Check your current cooldowns on commands', category: 'premium', premiumTier: 'free', cooldown: 3, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['cd', 'cooldowns'], examples: ['/cooldowncheck'] } as CommandOptions);
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const redis = getRedisClient();
    const embed = new EmbedBuilder().setTitle('⏱️ Your Cooldowns').setColor(COLORS.info);

    if (!redis) {
      embed.setDescription('❌ Redis is not connected. Cooldown tracking is unavailable.');
      await i.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    const pattern = `cooldown:${i.user.id}:*`;
    const keys = await redis.keys(pattern);

    if (!keys.length) {
      embed.setDescription('✅ You have no active cooldowns!');
    } else {
      const cooldowns: string[] = [];
      for (const key of keys.slice(0, 15)) {
        const ttl = await redis.ttl(key);
        const command = key.replace(`cooldown:${i.user.id}:`, '');
        if (ttl > 0) cooldowns.push(`• \`${command}\` — ${ttl}s remaining`);
      }
      embed.setDescription(cooldowns.length ? cooldowns.join('\n') : '✅ No active cooldowns!');
    }
    await i.reply({ embeds: [embed], ephemeral: true });
  }

  public async executePrefix(m: Message): Promise<void> {
    const redis = getRedisClient();
    if (!redis) { await m.reply('❌ Redis not connected.'); return; }
    const keys = await redis.keys(`cooldown:${m.author.id}:*`);
    if (!keys.length) { await m.reply('✅ No active cooldowns!'); return; }
    const lines: string[] = [];
    for (const key of keys.slice(0, 10)) {
      const ttl = await redis.ttl(key);
      const cmd = key.replace(`cooldown:${m.author.id}:`, '');
      if (ttl > 0) lines.push(`• \`${cmd}\` — ${ttl}s`);
    }
    await m.reply(`⏱️ **Active Cooldowns:**\n${lines.join('\n') || 'None'}`);
  }
}
export default CooldownCheckCommand;
