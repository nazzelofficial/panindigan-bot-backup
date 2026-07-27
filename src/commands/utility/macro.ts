// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import getMongoClient from '../../database/mongodb/client.js';

export class MacroCommand extends BaseCommand {
  constructor() {
    super({ name: 'macro', description: 'Command macros — create, list, delete, run', category: 'utility', premiumTier: 'diamond', cooldown: 3, guildOnly: true, ownerOnly: false, slashCommand: true, prefixCommand: true, aliases: ['macros'], examples: ['p!macro create greet hello | wave | hug', 'p!macro list', 'p!macro run greet'] } as CommandOptions);
  }
  private async run(i: ChatInputCommandInteraction | null, m: Message | null, sub: string, name: string, commands: string): Promise<void> {
    const guildId = i?.guildId ?? m?.guildId;
    if (!guildId) return;
    const userId = i?.user.id ?? m!.author.id;
    const send = async (e: EmbedBuilder) => { if (i) await i.reply({ embeds: [e] }); else await m!.reply({ embeds: [e] }); };
    const db = await getMongoClient();
    const col = db.collection('macros');
    if (sub === 'create' || sub === 'add') {
      if (!name || !commands) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Usage: `macro create <name> <cmd1 | cmd2 | ...>`'));
      const steps = commands.split('|').map(c => c.trim()).filter(Boolean);
      await col.updateOne({ guildId, name: name.toLowerCase() }, { $set: { guildId, name: name.toLowerCase(), steps, authorId: userId, updatedAt: new Date() } }, { upsert: true });
      await send(new EmbedBuilder().setColor(COLORS.success).setTitle('✅ Macro Created')
        .addFields({ name: 'Name', value: name, inline: true }, { name: 'Steps', value: steps.map((s, i) => `${i + 1}. ${s}`).join('\n'), inline: false }));
    } else if (sub === 'delete' || sub === 'remove') {
      await col.deleteOne({ guildId, name: name.toLowerCase() });
      await send(new EmbedBuilder().setColor(COLORS.success).setDescription(`🗑️ Macro \`${name}\` deleted.`));
    } else if (sub === 'run') {
      const macro = await col.findOne({ guildId, name: name.toLowerCase() });
      if (!macro) return send(new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ Macro \`${name}\` not found.`));
      await send(new EmbedBuilder().setColor(COLORS.default).setTitle(`▶️ Running Macro: ${name}`)
        .setDescription(`**Steps:**\n${macro.steps.map((s: string, idx: number) => `${idx + 1}. \`${s}\``).join('\n')}`));
    } else {
      const macros = await col.find({ guildId }).sort({ name: 1 }).toArray();
      await send(new EmbedBuilder().setColor(COLORS.default).setTitle('⚡ Server Macros')
        .setDescription(macros.length ? macros.map(m => `• \`${m.name}\` (${m.steps.length} steps)`).join('\n') : 'No macros. Create one with `macro create`.'));
    }
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const sub = i.options.getSubcommand(false) ?? 'list';
    await this.run(i, null, sub, i.options.getString('name') ?? '', i.options.getString('commands') ?? '');
  }
  public async executePrefix(m: Message, _args: string[]): Promise<void> { await this.run(null, m, args[0] ?? 'list', args[1] ?? '', _args.slice(2).join(' ')); }
}
export default MacroCommand;
