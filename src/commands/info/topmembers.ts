import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getMongoDb } from '../../database/mongodb/client';

export class TopMembersCommand extends BaseCommand {
  constructor() {
    super({
      name: 'topmembers',
      description: 'View the most active members in this server (Gold+)',
      category: 'info',
      premiumTier: 'gold',
      cooldown: 30,
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['activemembers', 'memberstats'],
      examples: ['/topmembers', 'p!topmembers'],
    } as CommandOptions);
  }

  private async buildEmbed(guild: any): Promise<EmbedBuilder> {
    try {
      const db = getMongoDb();
      const logs = db.collection('event_logs');

      const pipeline = [
        { $match: { guildId: guild.id, type: 'MESSAGE_CREATE', createdAt: { $gte: new Date(Date.now() - 30 * 86400000) } } },
        { $group: { _id: '$userId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ];

      const results = await logs.aggregate(pipeline).toArray().catch(() => []);

      if (!results.length) {
        return new EmbedBuilder()
          .setTitle(`📊 Most Active Members — ${guild.name}`)
          .setColor(COLORS.gold)
          .setDescription('No message activity data found.\nEnable activity logging to track member activity.');
      }

      const total = results.reduce((s: number, r: any) => s + r.count, 0);
      const list = await Promise.all(results.map(async (r: any, i: number) => {
        const member = await guild.members.fetch(r._id).catch(() => null);
        const name = member ? member.user.tag : `\`${r._id}\``;
        const pct = ((r.count / total) * 100).toFixed(1);
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `**${i + 1}.**`;
        return `${medal} ${name} — **${r.count.toLocaleString()}** messages (${pct}%)`;
      }));

      return new EmbedBuilder()
        .setTitle(`📊 Most Active Members — ${guild.name}`)
        .setColor(COLORS.gold)
        .setDescription(list.join('\n'))
        .addFields({ name: '📨 Total Messages (30d)', value: total.toLocaleString(), inline: true })
        .setFooter({ text: 'Gold tier analytics • Last 30 days' })
        .setTimestamp();
    } catch {
      return new EmbedBuilder()
        .setTitle(`📊 Most Active Members — ${guild.name}`)
        .setColor(COLORS.gold)
        .setDescription('Activity data is not yet available. Enable MongoDB logging to track member activity.')
        .setFooter({ text: 'Gold tier analytics' })
        .setTimestamp();
    }
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();
    const embed = await this.buildEmbed(interaction.guild!);
    await interaction.editReply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    if (!message.guild) return;
    const msg = await message.reply(`${EMOJIS.loading} Fetching member activity stats...`);
    const embed = await this.buildEmbed(message.guild);
    await msg.edit({ content: null, embeds: [embed] });
  }
}

export default TopMembersCommand;
