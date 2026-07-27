// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getMongoDb as getMongoClient } from '../../database/mongodb/client.js';

export class CronCommand extends BaseCommand {
  constructor() {
    super({ name: 'cron', description: 'Schedule recurring commands with cron expressions', category: 'utility', premiumTier: 'diamond', cooldown: 5, guildOnly: true, ownerOnly: false, slashCommand: true, prefixCommand: true, aliases: ['schedule', 'scheduler'], examples: ['p!cron "0 9 * * *" announce Good morning!', 'p!cron list', 'p!cron delete 1'] } as CommandOptions);
  }
  private async run(i: ChatInputCommandInteraction | null, m: Message | null, sub: string, expr: string, cmd: string): Promise<void> {
    const guildId = i?.guildId ?? m?.guildId;
    if (!guildId) return;
    const userId = i?.user.id ?? m!.author.id;
    const send = async (e: EmbedBuilder) => { if (i) await i.reply({ embeds: [e] }); else await m!.reply({ embeds: [e] }); };
    const db = await getMongoClient();
    const col = db.collection('cron_jobs');
    if (sub === 'create' || sub === 'add') {
      if (!expr || !cmd) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Usage: `cron create "<cron_expression>" <command>`'));
      await col.insertOne({ guildId, channelId: i?.channelId ?? m!.channelId, cron: expr, command: cmd, authorId: userId, enabled: true, createdAt: new Date() });
      await send(new EmbedBuilder().setColor(COLORS.success).setTitle('⏰ Cron Job Created')
        .addFields({ name: 'Schedule', value: `\`${expr}\``, inline: true }, { name: 'Command', value: cmd.slice(0, 100), inline: true })
        .setFooter({ text: 'Note: Cron jobs are stored; a cron runner service is required to execute them.' }));
    } else if (sub === 'delete') {
      await col.deleteOne({ guildId, _id: expr as any });
      await send(new EmbedBuilder().setColor(COLORS.success).setDescription('🗑️ Cron job deleted.'));
    } else {
      const jobs = await col.find({ guildId }).sort({ createdAt: -1 }).toArray();
      await send(new EmbedBuilder().setColor(COLORS.default).setTitle('⏰ Cron Jobs')
        .setDescription(jobs.length ? jobs.map(j => `• ${j.enabled ? '🟢' : '🔴'} \`${j.cron}\` → ${j.command.slice(0, 40)}`).join('\n') : 'No cron jobs configured.'));
    }
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const sub = i.options.getSubcommand(false) ?? 'list';
    await this.run(i, null, sub, i.options.getString('expression') ?? '', i.options.getString('command') ?? '');
  }
  public async executePrefix(m: Message, _args: string[]): Promise<void> { await this.run(null, m, args[0] ?? 'list', args[1] ?? '', _args.slice(2).join(' ')); }
}
export default CronCommand;
