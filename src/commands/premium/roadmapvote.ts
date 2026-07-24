import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';
import { getCollection } from '../../database/mongodb/client';

const ROADMAP_FEATURES = [
  { id: 'voicechat', name: '🎙️ AI Voice Chat', description: 'Talk to the bot using voice' },
  { id: 'mobileapp', name: '📱 Mobile Companion App', description: 'Control bot from phone' },
  { id: 'spotify', name: '🎵 Spotify Integration', description: 'Play from Spotify account' },
  { id: 'customavatar', name: '🎨 Custom Bot Avatar per Server', description: 'Server-specific bot avatar' },
  { id: 'advancedanalytics', name: '📊 Advanced Analytics Dashboard', description: 'Detailed growth metrics' },
  { id: 'automoderationai', name: '🤖 AI-Powered Auto-Moderation', description: 'Context-aware moderation' },
];

export class RoadmapVoteCommand extends BaseCommand {
  constructor() {
    super({ name: 'roadmap-vote', description: 'Vote on upcoming bot features (Diamond perk)', category: 'premium', premiumTier: 'diamond', cooldown: 86400, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['votepoll', 'featurevote'], examples: ['/roadmap-vote voicechat'] } as CommandOptions);
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const featureId = i.options.getString('feature');
    const col = getCollection('roadmap_votes');

    if (!featureId) {
      const votes = await col.aggregate([{ $group: { _id: '$featureId', count: { $sum: 1 } } }, { $sort: { count: -1 } }]).toArray();
      const voteCounts = Object.fromEntries(votes.map((v: any) => [v._id, v.count]));
      const embed = new EmbedBuilder().setTitle('🗳️ Roadmap Feature Votes').setColor(COLORS.diamond)
        .setDescription('Vote on features you want! Use `/roadmap-vote <feature-id>`')
        .addFields(...ROADMAP_FEATURES.map(f => ({ name: f.name, value: `${f.description}\n🗳️ ${voteCounts[f.id] || 0} votes | ID: \`${f.id}\``, inline: false })));
      await i.reply({ embeds: [embed] });
      return;
    }

    const feature = ROADMAP_FEATURES.find(f => f.id === featureId);
    if (!feature) { await i.reply({ content: '❌ Invalid feature ID.', ephemeral: true }); return; }

    const existing = await col.findOne({ userId: i.user.id, featureId });
    if (existing) { await i.reply({ content: `⚠️ You already voted for **${feature.name}**!`, ephemeral: true }); return; }

    await col.insertOne({ userId: i.user.id, featureId, createdAt: new Date() });
    const count = await col.countDocuments({ featureId });
    await i.reply({ content: `✅ Voted for **${feature.name}**! Total votes: **${count}**`, ephemeral: true });
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    const embed = new EmbedBuilder().setTitle('🗳️ Roadmap Votes').setColor(COLORS.diamond)
      .setDescription(ROADMAP_FEATURES.map(f => `• **${f.name}** (\`${f.id}\`): ${f.description}`).join('\n'));
    await m.reply({ embeds: [embed] });
  }
}
export default RoadmapVoteCommand;
