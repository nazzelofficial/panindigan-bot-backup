import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';

export class PriorityQueueCommand extends BaseCommand {
  constructor() {
    super({ name: 'priorityqueue', description: 'Add songs to the front of the queue (Bronze+ perk)', category: 'premium', premiumTier: 'bronze', cooldown: 3, guildOnly: true, slashCommand: true, prefixCommand: true, aliases: ['pq', 'priority'], examples: ['/priorityqueue <song>', 'p!priorityqueue <song>'] } as CommandOptions);
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const embed = new EmbedBuilder().setTitle('🥉 Priority Queue').setColor(COLORS.bronze)
      .setDescription('As a Bronze+ subscriber, your songs are automatically added to the **front** of the music queue!\n\nSimply use `/play` and your track will jump ahead of others.')
      .addFields({ name: '✅ How to Use', value: 'Use `/play <song>` — your song will be placed at position 1 in the queue.', inline: false })
      .setFooter({ text: 'Bronze Premium Perk' });
    await i.reply({ embeds: [embed] });
  }

  public async executePrefix(m: Message): Promise<void> {
    const embed = new EmbedBuilder().setTitle('🥉 Priority Queue').setColor(COLORS.bronze)
      .setDescription('As a Bronze+ subscriber, your songs are added to the front of the queue!\n\nUse `p!play <song>` and it will be placed at position 1.')
      .setFooter({ text: 'Bronze Premium Perk' });
    await m.reply({ embeds: [embed] });
  }
}
export default PriorityQueueCommand;
