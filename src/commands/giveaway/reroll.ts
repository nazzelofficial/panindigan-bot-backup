// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class GiveawayRerollCommand extends BaseCommand {
  constructor() {
    super({ name: 'greroll', description: 'Reroll winners for a finished giveaway', category: 'giveaway', premiumTier: 'free', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, userPermissions: [PermissionFlagsBits.ManageGuild], aliases: ['giveaway-reroll', 'gw-reroll'], examples: ['/greroll <id>', 'p!greroll <id>'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addStringOption(o => o.setName('id').setDescription('Giveaway ID').setRequired(true))
      .addIntegerOption(o => o.setName('winners').setDescription('Number of winners to reroll').setRequired(false).setMinValue(1).setMaxValue(20))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  private async doReroll(guildId: string, giveawayId: string, winnerCount: number, channel: any): Promise<string> {
    const prisma = getPrismaClient();
    const giveaway = await prisma.giveaway.findFirst({ where: { id: giveawayId, guildId } });
    if (!giveaway) return '❌ Giveaway not found.';

    const entries = await prisma.giveawayEntry.findMany({ where: { giveawayId: giveaway.id } });
    if (!entries.length) return '❌ No entries found for this giveaway.';

    const shuffled = [...entries].sort(() => Math.random() - 0.5);
    const winners = shuffled.slice(0, winnerCount);
    const winnerIds = winners.map(w => w.userId);

    await prisma.giveaway.update({ where: { id: giveaway.id }, data: { winnerId: winnerIds.join(',') } });

    if (channel?.isTextBased()) {
      await channel.send({ content: `🔄 **Giveaway Rerolled!**\n🎉 New winners for **${giveaway.prize}**: ${winnerIds.map((id: string) => `<@${id}>`).join(', ')}!` });
    }

    return `✅ Rerolled! New winners: ${winnerIds.map(id => `<@${id}>`).join(', ')}`;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const id = i.options.getString('id', true);
    const winners = i.options.getInteger('winners') || 1;
    await i.deferReply({ ephemeral: true });
    const prisma = getPrismaClient();
    const giveaway = await prisma.giveaway.findFirst({ where: { id, guildId: i.guildId! } });
    const channel = giveaway ? i.guild?.channels.cache.get(giveaway.channelId) : null;
    const result = await this.doReroll(i.guildId!, id, winners, channel);
    await i.editReply({ content: result });
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    if (!args[0]) { await m.reply('❌ Usage: `p!greroll <id> [winners]`'); return; }
    const prisma = getPrismaClient();
    const giveaway = await prisma.giveaway.findFirst({ where: { id: args[0], guildId: m.guildId! } });
    const channel = giveaway ? m.guild?.channels.cache.get(giveaway.channelId) : null;
    const result = await this.doReroll(m.guildId!, args[0], parseInt(args[1]) || 1, channel);
    await m.reply(result);
  }
}
export default GiveawayRerollCommand;
