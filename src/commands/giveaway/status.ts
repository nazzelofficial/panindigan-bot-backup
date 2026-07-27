// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class GiveawayStatusCommand extends BaseCommand {
  constructor() {
    super({ name: 'gstatus', description: 'Check the status of a specific giveaway', category: 'giveaway', premiumTier: 'free', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, aliases: ['giveaway-status', 'gw-status', 'ginfo'], examples: ['/gstatus <id>', 'p!gstatus <id>'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addStringOption(o => o.setName('id').setDescription('Giveaway ID').setRequired(true))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  private async getStatus(guildId: string, id: string): Promise<EmbedBuilder | string> {
    const prisma = getPrismaClient();
    const giveaway = await prisma.giveaway.findFirst({ where: { id, guildId } });
    if (!giveaway) return '❌ Giveaway not found.';
    const entryCount = await prisma.giveawayEntry.count({ where: { giveawayId: id } });
    const now = new Date();
    const ended = now > new Date(giveaway.endsAt);
    return new EmbedBuilder()
      .setTitle('📊 Giveaway Status')
      .setColor(giveaway.active ? COLORS.gold : COLORS.default)
      .addFields(
        { name: '🎁 Prize', value: giveaway.prize, inline: true },
        { name: '📌 Status', value: giveaway.active ? (ended ? '⏰ Ending soon...' : '✅ Active') : '🔒 Ended', inline: true },
        { name: '🎫 ID', value: `\`${giveaway.id}\``, inline: true },
        { name: '👥 Winners', value: `${giveaway.winnerCount}`, inline: true },
        { name: '📊 Entries', value: `${entryCount}`, inline: true },
        { name: '🕐 Ends', value: `<t:${Math.floor(new Date(giveaway.endsAt).getTime() / 1000)}:F>`, inline: true },
        { name: '👤 Hosted by', value: `<@${giveaway.hostId}>`, inline: true },
        ...(giveaway.winnerId ? [{ name: '🏆 Winners', value: giveaway.winnerId.split(',').map(id => `<@${id}>`).join(', '), inline: false }] : []),
      )
      .setTimestamp();
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const id = i.options.getString('id', true);
    const result = await this.getStatus(i.guildId!, id);
    if (typeof result === 'string') await i.reply({ content: result, ephemeral: true });
    else await i.reply({ embeds: [result] });
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    if (!args[0]) { await m.reply('❌ Usage: `p!gstatus <id>`'); return; }
    const result = await this.getStatus(m.guildId!, args[0]);
    if (typeof result === 'string') await m.reply(result);
    else await m.reply({ embeds: [result] });
  }
}
export default GiveawayStatusCommand;
