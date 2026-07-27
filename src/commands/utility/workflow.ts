// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getMongoDb as getMongoClient } from '../../database/mongodb/client.js';

export class WorkflowCommand extends BaseCommand {
  constructor() {
    super({ name: 'workflow', description: 'Automation workflows — create, list, run, delete', category: 'utility', premiumTier: 'diamond', cooldown: 3, guildOnly: true, ownerOnly: false, slashCommand: true, prefixCommand: true, aliases: ['workflows', 'automation'], examples: ['p!workflow create welcome "Send welcome message"', 'p!workflow list'] } as CommandOptions);
  }
  private async run(i: ChatInputCommandInteraction | null, m: Message | null, sub: string, name: string, description: string): Promise<void> {
    const guildId = i?.guildId ?? m?.guildId;
    if (!guildId) return;
    const userId = i?.user.id ?? m!.author.id;
    const send = async (e: EmbedBuilder) => { if (i) await i.reply({ embeds: [e] }); else await m!.reply({ embeds: [e] }); };
    const db = await getMongoClient();
    const col = db.collection('workflows');
    if (sub === 'create') {
      if (!name) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Provide a workflow name.'));
      await col.insertOne({ guildId, name, description: description || 'No description', authorId: userId, enabled: true, createdAt: new Date(), triggers: [], actions: [] });
      await send(new EmbedBuilder().setColor(COLORS.success).setTitle('✅ Workflow Created')
        .addFields({ name: 'Name', value: name, inline: true }, { name: 'Description', value: description || 'No description', inline: false })
        .setFooter({ text: 'Configure triggers and actions via the dashboard.' }));
    } else if (sub === 'delete') {
      await col.deleteOne({ guildId, name });
      await send(new EmbedBuilder().setColor(COLORS.success).setDescription(`🗑️ Workflow \`${name}\` deleted.`));
    } else if (sub === 'run') {
      const wf = await col.findOne({ guildId, name });
      if (!wf) return send(new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ Workflow \`${name}\` not found.`));
      await send(new EmbedBuilder().setColor(COLORS.default).setTitle(`▶️ Workflow: ${name}`)
        .setDescription(`**Status:** ${wf.enabled ? '🟢 Enabled' : '🔴 Disabled'}\n**Actions:** ${wf.actions?.length ?? 0}\n**Triggers:** ${wf.triggers?.length ?? 0}`));
    } else {
      const wfs = await col.find({ guildId }).sort({ name: 1 }).toArray();
      await send(new EmbedBuilder().setColor(COLORS.default).setTitle('⚙️ Server Workflows')
        .setDescription(wfs.length ? wfs.map(w => `• ${w.enabled ? '🟢' : '🔴'} \`${w.name}\` — ${w.description?.slice(0, 50)}`).join('\n') : 'No workflows configured.'));
    }
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const sub = i.options.getSubcommand(false) ?? 'list';
    await this.run(i, null, sub, i.options.getString('name') ?? '', i.options.getString('description') ?? '');
  }
  public async executePrefix(m: Message, _args: string[]): Promise<void> { await this.run(null, m, args[0] ?? 'list', args[1] ?? '', _args.slice(2).join(' ')); }
}
export default WorkflowCommand;
