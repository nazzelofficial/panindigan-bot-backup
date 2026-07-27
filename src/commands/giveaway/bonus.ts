// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class GiveawayBonusCommand extends BaseCommand {
  constructor() {
    super({ name: 'gbonus', description: 'Give bonus entries to specific roles in a giveaway', category: 'giveaway', premiumTier: 'free', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, userPermissions: [PermissionFlagsBits.ManageGuild], aliases: ['giveaway-bonus', 'gw-bonus'], examples: ['/gbonus <id> @role 2', 'p!gbonus <id> @role 2'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addStringOption(o => o.setName('id').setDescription('Giveaway ID').setRequired(true))
      .addRoleOption(o => o.setName('role').setDescription('Role to give bonus entries').setRequired(true))
      .addIntegerOption(o => o.setName('entries').setDescription('Number of bonus entries').setRequired(true).setMinValue(1).setMaxValue(10))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const id = i.options.getString('id', true);
    const role = i.options.getRole('role', true);
    const entries = i.options.getInteger('entries', true);

    const prisma = getPrismaClient();
    const g = await prisma.giveaway.findFirst({ where: { id, guildId: i.guildId!, active: true } });
    if (!g) { await i.reply({ content: '❌ Active giveaway not found.', ephemeral: true }); return; }

    // Store bonus in giveaway config (JSON field)
    const bonusRoles = (g as any).bonusRoles ? JSON.parse((g as any).bonusRoles || '{}') : {};
    bonusRoles[role.id] = entries;
    await prisma.giveaway.update({ where: { id }, data: { bonusRoles: JSON.stringify(bonusRoles) } as any });

    await i.reply({ content: `✅ Members with <@&${role.id}> will receive **${entries}** bonus entries!`, ephemeral: true });
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    if (args.length < 3) { await m.reply('❌ Usage: `p!gbonus <id> @role <entries>`'); return; }
    const [id, , bonusStr] = _args;
    const role = m.mentions.roles.first();
    if (!role) { await m.reply('❌ Mention a role.'); return; }
    const bonusEntries = parseInt(bonusStr) || 2;
    const prisma = getPrismaClient();
    const g = await prisma.giveaway.findFirst({ where: { id, guildId: m.guildId!, active: true } });
    if (!g) { await m.reply('❌ Active giveaway not found.'); return; }
    const bonusRoles = (g as any).bonusRoles ? JSON.parse((g as any).bonusRoles || '{}') : {};
    bonusRoles[role.id] = bonusEntries;
    await prisma.giveaway.update({ where: { id }, data: { bonusRoles: JSON.stringify(bonusRoles) } as any });
    await m.reply(`✅ Bonus entries set: ${role.name} gets ${bonusEntries} extra entries.`);
  }
}
export default GiveawayBonusCommand;
