// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class GiveawayResumeCommand extends BaseCommand {
  constructor() {
    super({ name: 'gresume', description: 'Resume a paused giveaway', category: 'giveaway', premiumTier: 'free', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, userPermissions: [PermissionFlagsBits.ManageGuild], aliases: ['giveaway-resume', 'gw-resume'], examples: ['/gresume <id>', 'p!gresume <id>'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description).addStringOption(o => o.setName('id').setDescription('Giveaway ID').setRequired(true)).setDMPermission(false)) as SlashCommandBuilder;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const id = i.options.getString('id', true);
    const prisma = getPrismaClient();
    const g = await prisma.giveaway.findFirst({ where: { id, guildId: i.guildId! } });
    if (!g) { await i.reply({ content: '❌ Giveaway not found.', ephemeral: true }); return; }
    await prisma.giveaway.update({ where: { id }, data: { paused: false } });
    await i.reply({ content: `▶️ Giveaway **${g.prize}** resumed!`, ephemeral: true });
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    if (!args[0]) { await m.reply('❌ Usage: `p!gresume <id>`'); return; }
    const prisma = getPrismaClient();
    const g = await prisma.giveaway.findFirst({ where: { id: args[0], guildId: m.guildId! } });
    if (!g) { await m.reply('❌ Giveaway not found.'); return; }
    await prisma.giveaway.update({ where: { id: args[0] }, data: { paused: false } });
    await m.reply(`▶️ Giveaway **${g.prize}** resumed!`);
  }
}
export default GiveawayResumeCommand;
