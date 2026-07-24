import { getCooldown, setCooldown } from '../database/redis/client';
import { PanindiganClient } from '../structures/PanindiganClient';
import config from '../../config.json';

export async function checkCooldown(
  client: PanindiganClient,
  userId: string,
  guildId: string,
  commandName: string,
  premiumTier: string = 'free'
): Promise<{ canRun: boolean; remaining: number }> {
  const categoryCooldowns = config.cooldowns.byCategorySeconds;
  const premiumMultipliers = config.cooldowns.premiumMultipliers;
  
  let cooldown = config.cooldowns.defaultSeconds;
  
  for (const [category, seconds] of Object.entries(categoryCooldowns)) {
    if (commandName.toLowerCase().includes(category)) {
      cooldown = seconds;
      break;
    }
  }

  const multiplier = premiumMultipliers[premiumTier as keyof typeof premiumMultipliers] || 1;
  const actualCooldown = Math.floor(cooldown * multiplier);

  if (actualCooldown === 0) {
    return { canRun: true, remaining: 0 };
  }

  const remaining = await getCooldown(userId, guildId, commandName);

  if (remaining > 0) {
    return { canRun: false, remaining };
  }

  await setCooldown(userId, guildId, commandName, actualCooldown);
  return { canRun: true, remaining: 0 };
}
