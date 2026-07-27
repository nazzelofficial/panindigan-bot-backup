// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getCollection } from '../../database/mongodb/client.js';

export class StarboardRandomCommand extends BaseCommand {
  constructor() {
    super({ name: 'starboard-random', description: 'Get a random starred message', category: 'starboard', premiumTier: 'free', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, aliases: ['sb-random', 'sbrandom', 'sbrnd'], examples: ['/starboard-random'] } as CommandOptions);
  }

  private async getRandom(guildId: string): Promise<EmbedBuilder | string> {
    const col = getCollection('starboard');
    const count = await col.countDocuments({ guildId });
    if (!count) return '📭 No starred messages in this server yet.';
    const skip = Math.floor(Math.random() * count);
    const doc: any = await col.findOne({ guildId }, { skip });
    if (!doc) return '📭 Could not find a starred message.';
    return new EmbedBuilder().setTitle('⭐ Random Starred Message').setColor(COLORS.gold)
      .setDescription(doc.content || '*[No text]*')
      .addFields({ name: '⭐ Stars', value: `${doc.starCount}`, inline: true }, { name: 'Author', value: `<@${doc.authorId}>`, inline: true }, { name: 'Jump', value: `[Go to message](${doc.jumpUrl || 'https://discord.com'})`, inline: true })
      .setTimestamp(doc.createdAt);
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const result = await this.getRandom(i.guildId!);
    if (typeof result === 'string') await i.reply({ content: result });
    else await i.reply({ embeds: [result] });
  }

  public async executePrefix(m: Message): Promise<void> {
    const result = await this.getRandom(m.guildId!);
    if (typeof result === 'string') await m.reply(result);
    else await m.reply({ embeds: [result] });
  }
}
export default StarboardRandomCommand;
