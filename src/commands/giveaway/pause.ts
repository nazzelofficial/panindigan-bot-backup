// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class GiveawayPauseCommand extends BaseCommand {
  constructor() {
    super({ name: 'gpause', description: 'Pause a giveaway (no new entries accepted)', category: 'giveaway', premiumTier: 'free', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, userPermissions: [PermissionFlagsBits.ManageGuild], aliases: ['giveaway-pause', 'gw-pause'], examples: ['/gpause <id>', 'p!gpause <id>'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description).addStringOption(o => o.setName('id').setDescription('Giveaway ID').setRequired(true)).setDMPermission(false)) as SlashCommandBuilder;
  }

  private async togglePause(guildId: string, id: string, paused: boolean): Promise<string> {
    const prisma = getPrismaClient();
    const giveaway = await prisma.giveaway.findFirst({ where: { id, guildId } });
    if (!giveaway) return '❌ Giveaway not found.';
    await prisma.giveaway.update({ where: { id }, data: { paused } });
    return paused ? `⏸️ Giveaway **${giveaway.prize}** paused. No new entries will be accepted.` : `▶️ Giveaway **${giveaway.prize}** resumed.`;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const id = i.options.getString('id', true);
    await i.reply({ content: await this.togglePause(i.guildId!, id, true), ephemeral: true });
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    if (!args[0]) { await m.reply('❌ Usage: `p!gpause <id>`'); return; }
    await m.reply(await this.togglePause(m.guildId!, args[0], true));
  }
}
export default GiveawayPauseCommand;
