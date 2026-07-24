import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { getPrismaClient } from '../../database/postgresql/client';

export class GiveawayWhitelistCommand extends BaseCommand {
  constructor() {
    super({ name: 'gwhitelist', description: 'Make a giveaway exclusive to specific roles only', category: 'giveaway', premiumTier: 'free', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, userPermissions: [PermissionFlagsBits.ManageGuild], aliases: ['giveaway-whitelist', 'gw-whitelist'], examples: ['/gwhitelist <id> @role', 'p!gwhitelist <id> @role'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addStringOption(o => o.setName('id').setDescription('Giveaway ID').setRequired(true))
      .addRoleOption(o => o.setName('role').setDescription('Exclusive role').setRequired(true))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const id = i.options.getString('id', true);
    const role = i.options.getRole('role', true);
    const prisma = getPrismaClient();
    const g = await prisma.giveaway.findFirst({ where: { id, guildId: i.guildId!, active: true } });
    if (!g) { await i.reply({ content: '❌ Active giveaway not found.', ephemeral: true }); return; }
    await prisma.giveaway.update({ where: { id }, data: { whitelistRoleId: role.id } as any });
    await i.reply({ content: `✅ Giveaway is now exclusive to <@&${role.id}> members only.`, ephemeral: true });
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    if (!args[0]) { await m.reply('❌ Usage: `p!gwhitelist <id> @role`'); return; }
    const role = m.mentions.roles.first();
    if (!role) { await m.reply('❌ Mention a role.'); return; }
    const prisma = getPrismaClient();
    const g = await prisma.giveaway.findFirst({ where: { id: args[0], guildId: m.guildId!, active: true } });
    if (!g) { await m.reply('❌ Giveaway not found.'); return; }
    await prisma.giveaway.update({ where: { id: args[0] }, data: { whitelistRoleId: role.id } as any });
    await m.reply(`✅ Giveaway whitelist set to <@&${role.id}>.`);
  }
}
export default GiveawayWhitelistCommand;
