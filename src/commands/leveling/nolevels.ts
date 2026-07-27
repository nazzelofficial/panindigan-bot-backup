// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class NoLevelsCommand extends BaseCommand {
  constructor() {
    super({
      name: 'nolevels',
      description: 'Toggle the leveling system on or off for this server',
      category: 'leveling',
      premiumTier: 'bronze',
      cooldown: 5,
      ownerOnly: false,
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      userPermissions: [PermissionFlagsBits.ManageGuild],
      aliases: ['toggleleveling', 'disableleveling'],
      examples: ['p!nolevels', '/nolevels'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  private async toggle(guildId: string): Promise<boolean> {
    const prisma = getPrismaClient();
    const guild = await prisma.guild.upsert({ where: { guildId }, create: { guildId }, update: {} });
    const newState = !guild.levelingEnabled;
    await prisma.guild.update({ where: { guildId }, data: { levelingEnabled: newState } });
    return newState;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    try {
      const enabled = await this.toggle(i.guildId!);
      const embed = new EmbedBuilder()
        .setColor(enabled ? COLORS.success : COLORS.error)
        .setTitle(`${EMOJIS.leveling} Leveling System`)
        .setDescription(enabled
          ? `${EMOJIS.success} Leveling system has been **enabled** for this server.`
          : `${EMOJIS.error} Leveling system has been **disabled** for this server.`
        )
        .setTimestamp();
      await i.reply({ embeds: [embed] });
    } catch {
      await i.reply({ content: `${EMOJIS.error} Failed to toggle leveling system.`, ephemeral: true });
    }
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    if (!m.member?.permissions.has(PermissionFlagsBits.ManageGuild)) {
      await m.reply(`${EMOJIS.error} You need **Manage Server** permission.`);
      return;
    }
    try {
      const enabled = await this.toggle(m.guildId!);
      const embed = new EmbedBuilder()
        .setColor(enabled ? COLORS.success : COLORS.error)
        .setTitle(`${EMOJIS.leveling} Leveling System`)
        .setDescription(enabled
          ? `${EMOJIS.success} Leveling system has been **enabled** for this server.`
          : `${EMOJIS.error} Leveling system has been **disabled** for this server.`
        )
        .setTimestamp();
      await m.reply({ embeds: [embed] });
    } catch {
      await m.reply(`${EMOJIS.error} Failed to toggle leveling system.`);
    }
  }
}
export default NoLevelsCommand;
