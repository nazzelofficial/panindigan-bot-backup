// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class GiveawayEntriesCommand extends BaseCommand {
  constructor() {
    super({ name: 'gentries', description: 'List all entries in a giveaway', category: 'giveaway', premiumTier: 'free', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, aliases: ['giveaway-entries', 'gw-entries'], examples: ['/gentries <id>', 'p!gentries <id>'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addStringOption(o => o.setName('id').setDescription('Giveaway ID').setRequired(true)).setDMPermission(false)) as SlashCommandBuilder;
  }

  private async getEntries(guildId: string, id: string): Promise<EmbedBuilder | string> {
    const prisma = getPrismaClient();
    const g = await prisma.giveaway.findFirst({ where: { id, guildId } });
    if (!g) return '❌ Giveaway not found.';
    const entries = await prisma.giveawayEntry.findMany({ where: { giveawayId: id }, orderBy: { createdAt: 'asc' } });
    const embed = new EmbedBuilder().setTitle(`📋 Entries for ${g.prize}`).setColor(COLORS.gold)
      .setDescription(entries.length ? entries.slice(0, 30).map((e, i) => `${i + 1}. <@${e.userId}>`).join('\n') + (entries.length > 30 ? `\n...and ${entries.length - 30} more` : '') : 'No entries yet.')
      .addFields({ name: 'Total Entries', value: `${entries.length}`, inline: true }, { name: 'Winners', value: `${g.winnerCount}`, inline: true })
      .setTimestamp();
    return embed;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const id = i.options.getString('id', true);
    const result = await this.getEntries(i.guildId!, id);
    if (typeof result === 'string') await i.reply({ content: result, ephemeral: true });
    else await i.reply({ embeds: [result] });
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    if (!args[0]) { await m.reply('❌ Usage: `p!gentries <id>`'); return; }
    const result = await this.getEntries(m.guildId!, args[0]);
    if (typeof result === 'string') await m.reply(result);
    else await m.reply({ embeds: [result] });
  }
}
export default GiveawayEntriesCommand;
