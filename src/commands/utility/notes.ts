import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';
import getMongoClient from '../../database/mongodb/client';

export class NotesCommand extends BaseCommand {
  constructor() {
    super({ name: 'notes', description: 'Personal notes system — create, list, delete', category: 'utility', premiumTier: 'silver', cooldown: 3, guildOnly: false, ownerOnly: false, slashCommand: true, prefixCommand: true, aliases: ['note', 'memo'], examples: ['/notes create Buy milk', 'p!notes list', 'p!notes delete 1'] } as CommandOptions);
  }
  private async run(i: ChatInputCommandInteraction | null, m: Message | null, sub: string, content: string): Promise<void> {
    const userId = i?.user.id ?? m!.author.id;
    const send = async (e: EmbedBuilder) => { if (i) await i.reply({ embeds: [e] }); else await m!.reply({ embeds: [e] }); };
    const db = await getMongoClient();
    const col = db.collection('user_notes');
    if (sub === 'create' || sub === 'add') {
      if (!content) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Provide note content.'));
      const count = await col.countDocuments({ userId });
      if (count >= 25) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ You have reached the maximum of 25 notes.'));
      await col.insertOne({ userId, content, createdAt: new Date(), noteId: Date.now() });
      await send(new EmbedBuilder().setColor(COLORS.success).setTitle('📝 Note Created').setDescription(content.slice(0, 500)));
    } else if (sub === 'list') {
      const notes = await col.find({ userId }).sort({ createdAt: -1 }).limit(25).toArray();
      if (!notes.length) return send(new EmbedBuilder().setColor(COLORS.default).setDescription('📝 You have no notes. Use `/notes create <text>` to add one.'));
      const embed = new EmbedBuilder().setColor(COLORS.default).setTitle('📝 Your Notes')
        .setDescription(notes.map((n, idx) => `**${idx + 1}.** ${n.content.slice(0, 100)}`).join('\n'));
      await send(embed);
    } else if (sub === 'delete' || sub === 'remove') {
      const idx = parseInt(content) - 1;
      const notes = await col.find({ userId }).sort({ createdAt: -1 }).limit(25).toArray();
      if (isNaN(idx) || !notes[idx]) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Invalid note number. Use `/notes list` to see your notes.'));
      await col.deleteOne({ _id: notes[idx]._id });
      await send(new EmbedBuilder().setColor(COLORS.success).setTitle('🗑️ Note Deleted').setDescription(`Note **#${idx + 1}** has been deleted.`));
    } else {
      await send(new EmbedBuilder().setColor(COLORS.default).setTitle('📝 Notes')
        .setDescription('**Subcommands:**\n`create <text>` — Create a new note\n`list` — View all notes\n`delete <number>` — Delete a note'));
    }
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const sub = i.options.getSubcommand(false) ?? i.options.getString('action') ?? 'list';
    await this.run(i, null, sub, i.options.getString('content') ?? '');
  }
  public async executePrefix(m: Message, args: string[]): Promise<void> { await this.run(null, m, args[0] ?? 'list', args.slice(1).join(' ')); }
}
export default NotesCommand;
