// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import getMongoClient from '../../database/mongodb/client.js';

export class TopguildsCommand extends BaseCommand {
  constructor() {
    super({ name: 'topguilds', description: 'Show top guilds by command usage', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['topg'], examples: ['p!topguilds'] } as CommandOptions);
  }
  private async run(i: ChatInputCommandInteraction | null, m: Message | null): Promise<void> {
    const send = async (e: EmbedBuilder) => { if (i) await i.reply({ embeds: [e], flags: 64 }); else await m!.reply({ embeds: [e] }); };
    try {
      const db = await getMongoClient();
      const client = i?.client ?? m!.client;
      const results = await db.collection('command_executions').aggregate([
        { $group: { _id: '$guildId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]).toArray();
      const embed = new EmbedBuilder().setColor(COLORS.default).setTitle('🏆 Top Guilds by Commands')
        .setDescription(results.length ? results.map((r, idx) => {
          const g = client.guilds.cache.get(r._id ?? '');
          return `**${idx + 1}.** ${g ? g.name : `\`${r._id}\``} — ${r.count.toLocaleString()} cmds`;
        }).join('\n') : 'No data yet.');
      await send(embed);
    } catch (err: any) {
      await send(new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ ${err.message}`));
    }
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> { await this.run(i, null); }
  public async executePrefix(m: Message): Promise<void> { await this.run(null, m); }
}
export default TopguildsCommand;
