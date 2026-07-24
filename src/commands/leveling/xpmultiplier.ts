import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

interface MultiplierEntry {
  roleId: string;
  multiplier: number;
}

export class XpMultiplierCommand extends BaseCommand {
  constructor() {
    super({
      name: 'xpmultiplier',
      description: 'Set XP multipliers for specific roles (Gold feature)',
      category: 'leveling',
      premiumTier: 'gold',
      cooldown: 5,
      ownerOnly: false,
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      userPermissions: [PermissionFlagsBits.ManageGuild],
      aliases: ['xpmult'],
      examples: [
        'p!xpmultiplier @Booster 2',
        'p!xpmultiplier list',
        'p!xpmultiplier remove @Booster',
        '/xpmultiplier set @Booster 1.5',
      ],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addSubcommand(s => s.setName('set').setDescription('Set an XP multiplier for a role')
        .addRoleOption(o => o.setName('role').setDescription('Target role').setRequired(true))
        .addNumberOption(o => o.setName('multiplier').setDescription('Multiplier (e.g. 1.5, 2, 3)').setRequired(true).setMinValue(0.1).setMaxValue(10)))
      .addSubcommand(s => s.setName('remove').setDescription('Remove an XP multiplier from a role')
        .addRoleOption(o => o.setName('role').setDescription('Target role').setRequired(true)))
      .addSubcommand(s => s.setName('list').setDescription('List all role XP multipliers'))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  private async getMultipliers(guildId: string): Promise<MultiplierEntry[]> {
    const prisma = getPrismaClient();
    const guild = await prisma.guild.findUnique({ where: { guildId } });
    const raw = (guild as any)?.xpMultipliers;
    if (!raw || !Array.isArray(raw)) return [];
    return raw as MultiplierEntry[];
  }

  private async saveMultipliers(guildId: string, entries: MultiplierEntry[]): Promise<void> {
    const prisma = getPrismaClient();
    await prisma.guild.upsert({
      where: { guildId },
      create: { guildId, ...(({ xpMultipliers: entries } as any)) },
      update: { ...(({ xpMultipliers: entries } as any)) },
    });
  }

  private buildListEmbed(guildId: string, entries: MultiplierEntry[]): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle(`${EMOJIS.gold} XP Multipliers`)
      .setColor(COLORS.gold)
      .setDescription(
        entries.length
          ? entries.map(e => `<@&${e.roleId}> → **${e.multiplier}x**`).join('\n')
          : 'No XP multipliers configured. Use `/xpmultiplier set @role <multiplier>` to add one.'
      )
      .setTimestamp();
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const sub = i.options.getSubcommand();
    const guildId = i.guildId!;
    try {
      if (sub === 'list') {
        const entries = await this.getMultipliers(guildId);
        await i.reply({ embeds: [this.buildListEmbed(guildId, entries)] });
      } else if (sub === 'set') {
        const role = i.options.getRole('role', true);
        const multiplier = i.options.getNumber('multiplier', true);
        const entries = await this.getMultipliers(guildId);
        const idx = entries.findIndex(e => e.roleId === role.id);
        if (idx >= 0) entries[idx].multiplier = multiplier;
        else entries.push({ roleId: role.id, multiplier });
        await this.saveMultipliers(guildId, entries);
        await i.reply({ content: `${EMOJIS.success} Set **${multiplier}x** XP multiplier for <@&${role.id}>.`, ephemeral: true });
      } else if (sub === 'remove') {
        const role = i.options.getRole('role', true);
        const entries = await this.getMultipliers(guildId);
        const filtered = entries.filter(e => e.roleId !== role.id);
        if (filtered.length === entries.length) { await i.reply({ content: `${EMOJIS.error} No multiplier found for that role.`, ephemeral: true }); return; }
        await this.saveMultipliers(guildId, filtered);
        await i.reply({ content: `${EMOJIS.success} Removed XP multiplier for <@&${role.id}>.`, ephemeral: true });
      }
    } catch {
      await i.reply({ content: `${EMOJIS.error} Failed to manage XP multipliers.`, ephemeral: true });
    }
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    if (!m.member?.permissions.has(PermissionFlagsBits.ManageGuild)) {
      await m.reply(`${EMOJIS.error} You need **Manage Server** permission.`);
      return;
    }
    const sub = args[0]?.toLowerCase();
    const guildId = m.guildId!;
    try {
      if (!sub || sub === 'list') {
        const entries = await this.getMultipliers(guildId);
        await m.reply({ embeds: [this.buildListEmbed(guildId, entries)] });
      } else if (sub === 'remove') {
        const role = m.mentions.roles.first();
        if (!role) { await m.reply(`${EMOJIS.error} Please mention a role.`); return; }
        const entries = await this.getMultipliers(guildId);
        const filtered = entries.filter(e => e.roleId !== role.id);
        if (filtered.length === entries.length) { await m.reply(`${EMOJIS.error} No multiplier found for that role.`); return; }
        await this.saveMultipliers(guildId, filtered);
        await m.reply(`${EMOJIS.success} Removed XP multiplier for <@&${role.id}>.`);
      } else {
        // p!xpmultiplier @role 2
        const role = m.mentions.roles.first();
        const multiplier = parseFloat(args[1] ?? args[2] ?? '');
        if (!role) { await m.reply(`${EMOJIS.error} Usage: \`p!xpmultiplier @role <multiplier>\``); return; }
        if (isNaN(multiplier) || multiplier < 0.1) { await m.reply(`${EMOJIS.error} Provide a valid multiplier (0.1–10).`); return; }
        const entries = await this.getMultipliers(guildId);
        const idx = entries.findIndex(e => e.roleId === role.id);
        if (idx >= 0) entries[idx].multiplier = multiplier;
        else entries.push({ roleId: role.id, multiplier });
        await this.saveMultipliers(guildId, entries);
        await m.reply(`${EMOJIS.success} Set **${multiplier}x** XP multiplier for <@&${role.id}>.`);
      }
    } catch {
      await m.reply(`${EMOJIS.error} Failed to manage XP multipliers.`);
    }
  }
}
export default XpMultiplierCommand;
