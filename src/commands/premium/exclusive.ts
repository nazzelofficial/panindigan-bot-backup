import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';

export class ExclusiveCommand extends BaseCommand {
  constructor() {
    super({ name: 'exclusive', description: 'View Diamond-exclusive content and commands', category: 'premium', premiumTier: 'diamond', cooldown: 5, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['diamondexclusive', 'premium-exclusive'], examples: ['/exclusive'] } as CommandOptions);
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const embed = new EmbedBuilder().setTitle('💎 Diamond Exclusive Commands').setColor(COLORS.diamond)
      .setDescription('As a Diamond subscriber, you have access to these exclusive commands:')
      .addFields(
        { name: '🖼️ `/imagine-hd`', value: 'Generate HD 1792x1024 AI images', inline: false },
        { name: '📝 `/longercontext`', value: 'Chat with AI using full 32K+ token context', inline: false },
        { name: '📊 `/analyticsaccess`', value: 'Full server analytics dashboard', inline: false },
        { name: '🚫 `/nocooldown`', value: 'Zero cooldowns on all commands', inline: false },
        { name: '🎵 `/maxqueue`', value: 'Unlimited music queue size', inline: false },
        { name: '🏆 `/custombadge`', value: 'Create your own profile badge', inline: false },
        { name: '🌐 `/concurrentai`', value: 'Run multiple AI sessions simultaneously', inline: false },
        { name: '📋 `/export-data`', value: 'Export all your data as JSON', inline: false },
        { name: '🗳️ `/roadmap-vote`', value: 'Vote on upcoming bot features', inline: false },
        { name: '🎭 `/background`', value: 'Set a custom profile background', inline: false },
      )
      .setFooter({ text: 'Diamond Premium — ₱399 one-time permanent' });
    await i.reply({ embeds: [embed], ephemeral: true });
  }

  public async executePrefix(m: Message): Promise<void> {
    await m.reply('💎 **Diamond Exclusive:** `/imagine-hd`, `/nocooldown`, `/maxqueue`, `/custombadge`, `/concurrentai`, `/analyticsaccess`, `/background`, `/roadmap-vote`');
  }
}
export default ExclusiveCommand;
