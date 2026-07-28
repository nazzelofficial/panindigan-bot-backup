// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getRedisClient } from '../../database/redis/client.js';

export class BypassCooldownCommand extends BaseCommand {
  constructor() {
    super({ name: 'bypass-cooldown', description: 'Bypass cooldown for a specific command (Gold+)', category: 'premium', premiumTier: 'gold', cooldown: 30, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['bypasscd', 'skipcd'], examples: ['/bypass-cooldown play', 'p!bypass-cooldown play'] } as CommandOptions);
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const redis = getRedisClient();
    const command = i.options.getString('command') || 'play';
    let cleared = false;
    if (redis) {
      const key = `cooldown:${i.user.id}:${command}`;
      const exists = await redis.exists(key);
      if (exists) { await redis.del(key); cleared = true; }
    }
    const embed = new EmbedBuilder().setTitle('⚡ Cooldown Bypass').setColor(COLORS.gold)
      .setDescription(cleared ? `✅ Bypassed cooldown for \`${command}\`!` : `ℹ️ No active cooldown found for \`${command}\`.`)
      .setFooter({ text: 'Gold Premium Perk' });
    await i.reply({ embeds: [embed], ephemeral: true });
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    const command = args[0] || 'play';
    const redis = getRedisClient();
    if (redis) { await redis.del(`cooldown:${m.author.id}:${command}`); }
    await m.reply(`⚡ Bypassed cooldown for \`${command}\`!`);
  }
}
export default BypassCooldownCommand;
