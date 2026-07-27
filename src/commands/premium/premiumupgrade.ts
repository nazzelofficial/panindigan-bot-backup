// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';

export class PremiumUpgradeCommand extends BaseCommand {
  constructor() {
    super({ name: 'premium-upgrade', description: 'Information about upgrading your premium tier', category: 'premium', premiumTier: 'free', cooldown: 5, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['upgrade', 'premiuminfo'], examples: ['/premium-upgrade'] } as CommandOptions);
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const embed = new EmbedBuilder().setTitle('⬆️ Upgrade Your Premium').setColor(COLORS.gold)
      .setDescription('All premium tiers are **one-time permanent purchases**!\nUse `/premium activate <key>` after purchasing.')
      .addFields(
        { name: '🥉 Bronze — ₱49', value: 'Priority queue • 100 AI/day • 150 song queue\nBoost XP 25% • Economy +15%', inline: false },
        { name: '🥈 Silver — ₱99', value: 'Custom prefix • Custom color • 300 AI/day\n300 song queue • XP boost 50%', inline: false },
        { name: '💛 Gold — ₱199', value: '1000 AI/day • GPT-4o access • 500 song queue\nHD images • Bypass cooldowns • Analytics', inline: false },
        { name: '💎 Diamond — ₱399', value: 'Unlimited queue • 5000 AI/day • No cooldowns\nEarly access • Concurrent AI • HD 1792px images\nExport data • Roadmap voting', inline: false },
        { name: '💎 Diamond Trial — FREE', value: '7-day trial for new users! Use `/premium trial`', inline: false },
      )
      .setFooter({ text: 'Contact an admin with your key to activate | All prices in PHP' });
    await i.reply({ embeds: [embed] });
  }

  public async executePrefix(m: Message): Promise<void> {
    await m.reply('⬆️ **Upgrade Tiers:**\n🥉 Bronze ₱49 | 🥈 Silver ₱99 | 💛 Gold ₱199 | 💎 Diamond ₱399\n*All permanent one-time purchases.*');
  }
}
export default PremiumUpgradeCommand;
