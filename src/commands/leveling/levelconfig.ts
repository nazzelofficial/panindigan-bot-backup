// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, TextChannel } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class LevelConfigCommand extends BaseCommand {
  constructor() {
    super({ name: 'levelconfig', description: 'Configure the leveling system', category: 'leveling', premiumTier: 'bronze', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, userPermissions: [PermissionFlagsBits.ManageGuild], aliases: ['xpconfig', 'levelsetup', 'rankconfig'], examples: ['/levelconfig toggle', '/levelconfig channel #general', '/levelconfig multiplier 2'] } as CommandOptions);
  }
  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addSubcommand(s => s.setName('toggle').setDescription('Enable or disable the leveling system'))
      .addSubcommand(s => s.setName('channel').setDescription('Set level-up announcement channel').addChannelOption(o => o.setName('channel').setDescription('Channel').setRequired(false)))
      .addSubcommand(s => s.setName('multiplier').setDescription('Set XP multiplier').addNumberOption(o => o.setName('value').setDescription('Multiplier (0.5 - 10)').setRequired(true).setMinValue(0.5).setMaxValue(10)))
      .addSubcommand(s => s.setName('message').setDescription('Set level-up message template').addStringOption(o => o.setName('text').setDescription('Use {user} {level} as placeholders').setRequired(true)))
      .addSubcommand(s => s.setName('info').setDescription('View leveling config'))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const sub = i.options.getSubcommand();
    const prisma = getPrismaClient();
    if (sub === 'toggle') {
      const guild = await prisma.guild.upsert({ where: { guildId: i.guildId! }, create: { guildId: i.guildId! }, update: {} });
      const newState = !(guild as any).levelingEnabled;
      await prisma.guild.update({ where: { guildId: i.guildId! }, data: { levelingEnabled: newState } });
      await i.reply({ content: `✅ Leveling system is now **${newState ? 'enabled' : 'disabled'}**.`, ephemeral: true });
    } else if (sub === 'channel') {
      const ch = i.options.getChannel('channel');
      await prisma.guild.upsert({ where: { guildId: i.guildId! }, create: { guildId: i.guildId!, levelUpChannelId: ch?.id || null }, update: { levelUpChannelId: ch?.id || null } });
      await i.reply({ content: ch ? `✅ Level-up announcements set to <#${ch.id}>` : '✅ Level-up channel cleared (announces in message channel).', ephemeral: true });
    } else if (sub === 'multiplier') {
      const value = i.options.getNumber('value', true);
      await prisma.guild.upsert({ where: { guildId: i.guildId! }, create: { guildId: i.guildId!, xpMultiplier: value }, update: { xpMultiplier: value } });
      await i.reply({ content: `✅ XP multiplier set to **${value}x**.`, ephemeral: true });
    } else if (sub === 'message') {
      const text = i.options.getString('text', true);
      await prisma.guild.upsert({ where: { guildId: i.guildId! }, create: { guildId: i.guildId!, levelUpMessage: text }, update: { levelUpMessage: text } });
      await i.reply({ content: `✅ Level-up message set to:\n*${text}*`, ephemeral: true });
    } else if (sub === 'info') {
      const guild = await prisma.guild.findUnique({ where: { guildId: i.guildId! } });
      const embed = new EmbedBuilder().setTitle('⚙️ Leveling Config').setColor(COLORS.default)
        .addFields(
          { name: 'Status', value: (guild as any)?.levelingEnabled !== false ? '✅ Enabled' : '❌ Disabled', inline: true },
          { name: 'XP Multiplier', value: `${(guild as any)?.xpMultiplier || 1}x`, inline: true },
          { name: 'Announce Channel', value: guild?.levelUpChannelId ? `<#${guild.levelUpChannelId}>` : 'Message channel', inline: true },
          { name: 'Level-up Message', value: guild?.levelUpMessage || 'Default', inline: false },
        );
      await i.reply({ embeds: [embed] });
    }
  }
  public async executePrefix(m: Message, _args: string[]): Promise<void> { await m.reply('Please use `/levelconfig` slash commands.'); }
}
export default LevelConfigCommand;
