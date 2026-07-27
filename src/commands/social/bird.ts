// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';

const BIRD_APIS = [
  'https://some-random-api.com/img/birb',
  'https://some-random-api.com/img/birb',
];

export class BirdCommand extends BaseCommand {
  constructor() {
    super({ name: 'bird', description: 'Get a random bird picture 🐦', category: 'social', premiumTier: 'gold', cooldown: 3, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['birb', 'randombird'], examples: ['/bird', 'p!bird'] } as CommandOptions);
  }

  private async fetchBird(): Promise<string> {
    try {
      const res = await fetch('https://some-random-api.com/img/birb', { signal: AbortSignal.timeout(5000) });
      const data: any = await res.json();
      return data.link || data.url || 'https://i.imgur.com/eTh7Kf4.jpeg';
    } catch {
      return 'https://i.imgur.com/eTh7Kf4.jpeg';
    }
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    const url = await this.fetchBird();
    const embed = new EmbedBuilder()
      .setTitle('🐦 Random Bird!')
      .setImage(url)
      .setColor(COLORS.info)
      .setFooter({ text: 'Panindigan Social' });
    await i.editReply({ embeds: [embed] });
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    const url = await this.fetchBird();
    const embed = new EmbedBuilder()
      .setTitle('🐦 Random Bird!')
      .setImage(url)
      .setColor(COLORS.info)
      .setFooter({ text: 'Panindigan Social' });
    await m.reply({ embeds: [embed] });
  }
}
export default BirdCommand;
