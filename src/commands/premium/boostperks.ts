import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class BoostPerksCommand extends BaseCommand {
  constructor() {
    super({ name: 'boostperks', description: 'View all perks available for server boosters', category: 'premium', premiumTier: 'free', cooldown: 5, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['boosterperks', 'nitroboost'], examples: ['/boostperks'] } as CommandOptions);
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const embed = new EmbedBuilder().setTitle('🚀 Server Booster Perks').setColor(COLORS.gold)
      .setDescription('Thank you for boosting! Here are your exclusive perks:')
      .addFields(
        { name: '🎨 Custom Color', value: 'Use `/customcolor` to set your embed color', inline: false },
        { name: '⭐ XP Boost', value: '+25% XP from all activities', inline: false },
        { name: '💰 Economy Bonus', value: '+15% from all money commands', inline: false },
        { name: '🤖 AI Bonus', value: '+50 extra AI daily credits', inline: false },
        { name: '🎉 Giveaway Bonus', value: 'Extra entry in all giveaways', inline: false },
        { name: '🏷️ Special Badge', value: 'Exclusive Booster badge on your profile', inline: false },
      )
      .setFooter({ text: 'Boost the server to unlock these perks!' });
    await i.reply({ embeds: [embed] });
  }

  public async executePrefix(m: Message): Promise<void> {
    const embed = new EmbedBuilder().setTitle('🚀 Booster Perks').setColor(COLORS.gold)
      .setDescription('**+25% XP** | **+15% Economy** | **Custom Color** | **Extra AI Credits** | **Giveaway Bonus**');
    await m.reply({ embeds: [embed] });
  }
}
export default BoostPerksCommand;
