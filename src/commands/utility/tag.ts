// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getMongoDb as getMongoClient } from '../../database/mongodb/client.js';

export class TagCommand extends BaseCommand {
  constructor() {
    super({ name: 'tag', description: 'Custom server tags — create, show, list, delete', category: 'utility', premiumTier: 'diamond', cooldown: 3, guildOnly: true, ownerOnly: false, slashCommand: true, prefixCommand: true, aliases: ['tags', 'snippet'], examples: ['/tag show rules', 'p!tag create rules Read the rules!', 'p!tag list'] } as CommandOptions);
  }
  private async run(i: ChatInputCommandInteraction | null, m: Message | null, sub: string, name: string, content: string): Promise<void> {
    const guildId = i?.guildId ?? m?.guildId;
    if (!guildId) return;
    const send = async (e: EmbedBuilder) => { if (i) await i.reply({ embeds: [e] }); else await m!.reply({ embeds: [e] }); };
    const db = await getMongoClient();
    const col = db.collection('server_tags');
    if (sub === 'show' || sub === 'get') {
      if (!name) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Provide a tag name.'));
      const tag = await col.findOne({ guildId, name: name.toLowerCase() });
      if (!tag) return send(new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ Tag \`${name}\` not found.`));
      await send(new EmbedBuilder().setColor(COLORS.default).setTitle(`🏷️ ${tag.name}`).setDescription(tag.content));
    } else if (sub === 'create' || sub === 'add') {
      if (!name || !content) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Provide both a name and content.'));
      const exists = await col.findOne({ guildId, name: name.toLowerCase() });
      if (exists) return send(new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ Tag \`${name}\` already exists. Delete it first.`));
      await col.insertOne({ guildId, name: name.toLowerCase(), content, authorId: i?.user.id ?? m!.author.id, createdAt: new Date() });
      await send(new EmbedBuilder().setColor(COLORS.success).setTitle('✅ Tag Created').addFields({ name: 'Name', value: name, inline: true }));
    } else if (sub === 'delete' || sub === 'remove') {
      if (!name) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Provide a tag name.'));
      const result = await col.deleteOne({ guildId, name: name.toLowerCase() });
      await send(new EmbedBuilder().setColor(result.deletedCount ? COLORS.success : COLORS.error)
        .setTitle(result.deletedCount ? '🗑️ Tag Deleted' : '❌ Not Found')
        .setDescription(result.deletedCount ? `Tag \`${name}\` deleted.` : `Tag \`${name}\` not found.`));
    } else {
      const tags = await col.find({ guildId }).sort({ name: 1 }).toArray();
      const embed = new EmbedBuilder().setColor(COLORS.default).setTitle('🏷️ Server Tags')
        .setDescription(tags.length ? tags.map(t => `• \`${t.name}\``).join('\n') : 'No tags yet. Use `tag create <name> <content>` to add one.');
      await send(embed);
    }
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const sub = i.options.getSubcommand(false) ?? 'list';
    await this.run(i, null, sub, i.options.getString('name') ?? '', i.options.getString('content') ?? '');
  }
  public async executePrefix(m: Message, _args: string[]): Promise<void> { await this.run(null, m, args[0] ?? 'list', args[1] ?? '', _args.slice(2).join(' ')); }
}
export default TagCommand;
