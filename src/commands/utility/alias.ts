// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getMongoDb as getMongoClient } from '../../database/mongodb/client.js';

export class AliasCommand extends BaseCommand {
  constructor() {
    super({ name: 'alias', description: 'Custom command aliases — create, list, delete', category: 'utility', premiumTier: 'diamond', cooldown: 3, guildOnly: true, ownerOnly: false, slashCommand: true, prefixCommand: true, aliases: ['customalias'], examples: ['p!alias create pl play', 'p!alias list'] } as CommandOptions);
  }
  private async run(i: ChatInputCommandInteraction | null, m: Message | null, sub: string, aliasName: string, target: string): Promise<void> {
    const guildId = i?.guildId ?? m?.guildId;
    if (!guildId) return;
    const userId = i?.user.id ?? m!.author.id;
    const send = async (e: EmbedBuilder) => { if (i) await i.reply({ embeds: [e] }); else await m!.reply({ embeds: [e] }); };
    const db = await getMongoClient();
    const col = db.collection('custom_aliases');
    if (sub === 'create' || sub === 'add') {
      if (!aliasName || !target) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Usage: `alias create <alias> <target_command>`'));
      const count = await col.countDocuments({ guildId });
      if (count >= 30) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Max 30 aliases per server.'));
      await col.updateOne({ guildId, alias: aliasName.toLowerCase() }, { $set: { guildId, alias: aliasName.toLowerCase(), target, authorId: userId, updatedAt: new Date() } }, { upsert: true });
      await send(new EmbedBuilder().setColor(COLORS.success).setTitle('✅ Alias Created').addFields({ name: 'Alias', value: `\`${aliasName}\``, inline: true }, { name: 'Target', value: target, inline: true }));
    } else if (sub === 'delete' || sub === 'remove') {
      await col.deleteOne({ guildId, alias: aliasName.toLowerCase() });
      await send(new EmbedBuilder().setColor(COLORS.success).setDescription(`🗑️ Alias \`${aliasName}\` deleted.`));
    } else {
      const aliases = await col.find({ guildId }).sort({ alias: 1 }).toArray();
      await send(new EmbedBuilder().setColor(COLORS.default).setTitle('🏷️ Custom Aliases')
        .setDescription(aliases.length ? aliases.map(a => `• \`${a.alias}\` → \`${a.target}\``).join('\n') : 'No aliases. Use `alias create <alias> <command>`.'));
    }
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const sub = i.options.getSubcommand(false) ?? 'list';
    await this.run(i, null, sub, i.options.getString('name') ?? '', i.options.getString('target') ?? '');
  }
  public async executePrefix(m: Message, _args: string[]): Promise<void> { await this.run(null, m, args[0] ?? 'list', args[1] ?? '', args[2] ?? ''); }
}
export default AliasCommand;
