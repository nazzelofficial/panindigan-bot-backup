// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class CustomColorCommand extends BaseCommand {
  constructor() {
    super({ name: 'customcolor', description: 'Set a custom embed color for your profile (Silver+ perk)', category: 'premium', premiumTier: 'silver', cooldown: 5, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['embedcolor', 'mycolor'], examples: ['/customcolor #ff6699', 'p!customcolor #ff6699'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addStringOption(o => o.setName('color').setDescription('Hex color code (e.g. #ff6699)').setRequired(true))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  private parseColor(hex: string): number | null {
    const clean = hex.replace('#', '');
    const num = parseInt(clean, 16);
    return isNaN(num) ? null : num;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const colorStr = i.options.getString('color', true);
    const color = this.parseColor(colorStr);
    if (color === null) { await i.reply({ content: '❌ Invalid hex color. Example: `#ff6699`', ephemeral: true }); return; }

    const prisma = getPrismaClient();
    await prisma.user.upsert({
      where: { userId_guildId: { userId: i.user.id, guildId: i.guildId || 'global' } },
      create: { userId: i.user.id, guildId: i.guildId || 'global', customColor: colorStr },
      update: { customColor: colorStr },
    }).catch(() => {});

    const embed = new EmbedBuilder().setTitle('🎨 Custom Color Set').setColor(color)
      .setDescription(`Your embed color is now **${colorStr}**!\nThis will be used in your profile and other embeds.`)
      .setFooter({ text: 'Silver Premium Perk' });
    await i.reply({ embeds: [embed] });
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    const colorStr = args[0];
    if (!colorStr) { await m.reply('❌ Usage: `p!customcolor <#hexcode>`'); return; }
    const color = this.parseColor(colorStr);
    if (color === null) { await m.reply('❌ Invalid hex color.'); return; }
    const prisma = getPrismaClient();
    await prisma.user.upsert({ where: { userId_guildId: { userId: m.author.id, guildId: m.guildId || 'global' } }, create: { userId: m.author.id, guildId: m.guildId || 'global', customColor: colorStr }, update: { customColor: colorStr } }).catch(() => {});
    const embed = new EmbedBuilder().setTitle('🎨 Color Set').setColor(color).setDescription(`Your color is now **${colorStr}**!`);
    await m.reply({ embeds: [embed] });
  }
}
export default CustomColorCommand;
