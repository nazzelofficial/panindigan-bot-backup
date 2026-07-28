// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class CustomPrefixCommand extends BaseCommand {
  constructor() {
    super({ name: 'customprefix', description: 'Set a custom bot prefix for this server (Silver+ perk)', category: 'premium', premiumTier: 'silver', cooldown: 10, guildOnly: true, slashCommand: true, prefixCommand: true, aliases: ['setprefix2', 'myprefix'], examples: ['/customprefix !', 'p!customprefix !'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addStringOption(o => o.setName('prefix').setDescription('New prefix (1-5 chars)').setRequired(true).setMinLength(1).setMaxLength(5))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const prefix = i.options.getString('prefix', true);
    if (prefix.length > 5) { await i.reply({ content: '❌ Prefix must be 5 characters or less.', ephemeral: true }); return; }
    const prisma = getPrismaClient();
    await prisma.guild.upsert({ where: { guildId: i.guildId! }, create: { guildId: i.guildId!, prefix }, update: { prefix } });
    const embed = new EmbedBuilder().setTitle('✅ Custom Prefix Set').setColor(COLORS.silver)
      .setDescription(`Bot prefix changed to \`${prefix}\`\nUse commands with \`${prefix}command\``)
      .setFooter({ text: 'Silver Premium Perk' });
    await i.reply({ embeds: [embed] });
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    const prefix = args[0];
    if (!prefix) { await m.reply('❌ Usage: `p!customprefix <new-prefix>`'); return; }
    if (prefix.length > 5) { await m.reply('❌ Prefix must be 5 characters or less.'); return; }
    const prisma = getPrismaClient();
    await prisma.guild.upsert({ where: { guildId: m.guildId! }, create: { guildId: m.guildId!, prefix }, update: { prefix } });
    await m.reply(`✅ Prefix changed to \`${prefix}\`!`);
  }
}
export default CustomPrefixCommand;
