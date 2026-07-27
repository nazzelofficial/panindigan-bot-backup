// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, AttachmentBuilder } from 'discord.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
import { getCollection } from '../../database/mongodb/client.js';

export class ExportDataCommand extends BaseCommand {
  constructor() {
    super({ name: 'export-data', description: 'Export your personal bot data as JSON (Gold+ perk)', category: 'premium', premiumTier: 'gold', cooldown: 60, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['mydata', 'dataexport'], examples: ['/export-data'] } as CommandOptions);
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const prisma = getPrismaClient();
    const [users, economy, premium, leveling] = await Promise.all([
      prisma.user.findMany({ where: { userId: i.user.id } }),
      prisma.economy.findMany({ where: { userId: i.user.id } }).catch(() => []),
      prisma.premium.findMany({ where: { userId: i.user.id } }),
      prisma.leveling.findMany({ where: { userId: i.user.id } }).catch(() => []),
    ]);
    const aiCol = getCollection('ai_conversations');
    const conversations = await aiCol.find({ userId: i.user.id }).toArray();

    const exportData = {
      exportedAt: new Date().toISOString(),
      userId: i.user.id,
      username: i.user.username,
      profiles: users,
      economy,
      premium,
      leveling,
      aiConversations: conversations.map((c: any) => ({ guildId: c.guildId, messageCount: c.messages?.length || 0, lastUpdated: c.updatedAt })),
    };

    const json = JSON.stringify(exportData, null, 2);
    const attachment = new AttachmentBuilder(Buffer.from(json, 'utf-8'), { name: `panindigan_data_${i.user.id}_${Date.now()}.json` });
    await i.editReply({ content: '✅ Your data export is ready!', files: [attachment] });
  }

  public async executePrefix(m: Message): Promise<void> {
    const prisma = getPrismaClient();
    const users = await prisma.user.findMany({ where: { userId: m.author.id } });
    const json = JSON.stringify({ userId: m.author.id, profiles: users }, null, 2);
    const attachment = new AttachmentBuilder(Buffer.from(json, 'utf-8'), { name: `data_${m.author.id}.json` });
    await m.reply({ content: '✅ Your data:', files: [attachment] });
  }
}
export default ExportDataCommand;
