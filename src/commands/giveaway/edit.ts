// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class GiveawayEditCommand extends BaseCommand {
  constructor() {
    super({ name: 'gedit', description: 'Edit an active giveaway (prize, time, winners)', category: 'giveaway', premiumTier: 'free', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, userPermissions: [PermissionFlagsBits.ManageGuild], aliases: ['giveaway-edit', 'gw-edit'], examples: ['/gedit <id>', 'p!gedit <id>'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addStringOption(o => o.setName('id').setDescription('Giveaway ID').setRequired(true))
      .addStringOption(o => o.setName('prize').setDescription('New prize name').setRequired(false))
      .addIntegerOption(o => o.setName('winners').setDescription('New winner count').setRequired(false).setMinValue(1).setMaxValue(20))
      .addStringOption(o => o.setName('add_time').setDescription('Add extra time (e.g. 1h, 30m)').setRequired(false))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const id = i.options.getString('id', true);
    const prize = i.options.getString('prize');
    const winners = i.options.getInteger('winners');
    const addTime = i.options.getString('add_time');

    const prisma = getPrismaClient();
    const g = await prisma.giveaway.findFirst({ where: { id, guildId: i.guildId!, active: true } });
    if (!g) { await i.reply({ content: '❌ Active giveaway not found.', ephemeral: true }); return; }

    const updateData: any = {};
    if (prize) updateData.prize = prize;
    if (winners) updateData.winnerCount = winners;
    if (addTime) {
      const units: Record<string, number> = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
      const match = addTime.match(/^(\d+)([smhd])$/i);
      if (match) updateData.endsAt = new Date(new Date(g.endsAt).getTime() + parseInt(match[1]) * (units[match[2].toLowerCase()] || 0));
    }

    await prisma.giveaway.update({ where: { id }, data: updateData });
    await i.reply({ content: `✅ Giveaway updated successfully!${prize ? ` New prize: **${prize}**` : ''}${winners ? ` New winners: **${winners}**` : ''}${addTime ? ` Added **${addTime}** to duration.` : ''}`, ephemeral: true });
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    if (args.length < 3) { await m.reply('❌ Usage: `p!gedit <id> prize <new prize>` or `p!gedit <id> winners <count>`'); return; }
    const [id, field, ...rest] = args;
    const prisma = getPrismaClient();
    const g = await prisma.giveaway.findFirst({ where: { id, guildId: m.guildId!, active: true } });
    if (!g) { await m.reply('❌ Active giveaway not found.'); return; }
    const updateData: any = {};
    if (field === 'prize') updateData.prize = rest.join(' ');
    else if (field === 'winners') updateData.winnerCount = parseInt(rest[0]) || g.winnerCount;
    await prisma.giveaway.update({ where: { id }, data: updateData });
    await m.reply('✅ Giveaway updated!');
  }
}
export default GiveawayEditCommand;
