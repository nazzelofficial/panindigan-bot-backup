// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';

export class MaxQueueCommand extends BaseCommand {
  constructor() {
    super({ name: 'maxqueue', description: 'View your maximum music queue size based on your tier', category: 'premium', premiumTier: 'free', cooldown: 5, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['queuelimit', 'queuesize'], examples: ['/maxqueue'] } as CommandOptions);
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const tierLimits: Record<string, number> = { free: 50, bronze: 150, silver: 300, gold: 500, diamond: -1 };
    const embed = new EmbedBuilder().setTitle('🎵 Queue Size Limits').setColor(COLORS.info)
      .setDescription('Here are the maximum queue sizes per premium tier:')
      .addFields(
        { name: '🆓 Free', value: '50 songs', inline: true },
        { name: '🥉 Bronze', value: '150 songs', inline: true },
        { name: '🥈 Silver', value: '300 songs', inline: true },
        { name: '💛 Gold', value: '500 songs', inline: true },
        { name: '💎 Diamond', value: '**Unlimited**', inline: true },
      )
      .setFooter({ text: 'Upgrade at /premium to increase your limit!' });
    await i.reply({ embeds: [embed] });
  }

  public async executePrefix(m: Message): Promise<void> {
    await m.reply('🎵 **Queue Limits:** Free: 50 | Bronze: 150 | Silver: 300 | Gold: 500 | Diamond: ♾️');
  }
}
export default MaxQueueCommand;
