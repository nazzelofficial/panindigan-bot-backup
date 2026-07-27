// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { imageService } from '../../services/ImageService.js';

export class MemeCommand extends BaseCommand {
  constructor() {
    super({ name: 'meme', description: 'Get a random meme from Reddit', category: 'image', premiumTier: 'free', cooldown: 5, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['randommeme', 'getmeme'], examples: ['/meme', 'p!meme'] } as CommandOptions);
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    try {
      const meme = await imageService.getMeme();
      const embed = new EmbedBuilder().setTitle(meme.title.slice(0, 256)).setColor(COLORS.default)
        .setImage(meme.url)
        .setFooter({ text: `r/${meme.subreddit} • u/${meme.author} • ⬆️ ${meme.upvotes.toLocaleString()}` });
      await i.editReply({ embeds: [embed] });
    } catch (e: any) { await i.editReply({ content: `❌ ${e.message || 'Failed to fetch meme.'}` }); }
  }

  public async executePrefix(m: Message): Promise<void> {
    const msg = await m.reply('⏳ Fetching meme...');
    try {
      const meme = await imageService.getMeme();
      const embed = new EmbedBuilder().setTitle(meme.title.slice(0, 256)).setColor(COLORS.default)
        .setImage(meme.url).setFooter({ text: `r/${meme.subreddit}` });
      await msg.edit({ content: '', embeds: [embed] });
    } catch { await msg.edit('❌ Failed.'); }
  }
}
export default MemeCommand;
