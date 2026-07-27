// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
export class YoutubeCommand extends BaseCommand {
    constructor() {
        super({ name: 'youtube', description: 'Search YouTube for a video', category: 'utility', premiumTier: 'free', cooldown: 5, guildOnly: false, ownerOnly: false, slashCommand: true, prefixCommand: true, aliases: ['yt', 'ytsearch'], examples: ['/youtube lofi hip hop', 'p!youtube coding music'] });
    }
    async run(i, m, query) {
        const send = async (e) => { if (i)
            await i.reply({ embeds: [e] });
        else
            await m.reply({ embeds: [e] }); };
        if (!query)
            return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Provide a search query.'));
        const apiKey = process.env.YOUTUBE_API_KEY;
        if (!apiKey) {
            return send(new EmbedBuilder().setColor(COLORS.default).setTitle('🎬 YouTube Search')
                .setDescription(`Click here to search on YouTube:\n🔗 [Search "${query}" on YouTube](https://www.youtube.com/results?search_query=${encodeURIComponent(query)})`));
        }
        try {
            const resp = await fetch(`https://www.googleapis.com/youtube/v3/search?q=${encodeURIComponent(query)}&type=video&maxResults=1&key=${apiKey}`, { signal: AbortSignal.timeout(8000) });
            const data = await resp.json();
            const item = data.items?.[0];
            if (!item)
                return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ No results found.'));
            const embed = new EmbedBuilder().setColor(0xFF0000).setTitle(item.snippet.title)
                .setURL(`https://www.youtube.com/watch?v=${item.id.videoId}`)
                .setDescription(item.snippet.description.slice(0, 300))
                .setThumbnail(item.snippet.thumbnails?.high?.url)
                .addFields({ name: '👤 Channel', value: item.snippet.channelTitle, inline: true }, { name: '📅 Published', value: new Date(item.snippet.publishedAt).toDateString(), inline: true });
            await send(embed);
        }
        catch (err) {
            await send(new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ ${err.message}`));
        }
    }
    async executeSlash(i) { await this.run(i, null, i.options.getString('query', true)); }
    async executePrefix(m, _args) { await this.run(null, m, args.join(' ')); }
}
export default YoutubeCommand;
