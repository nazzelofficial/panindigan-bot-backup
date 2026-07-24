import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

const VALID_STYLES = ['default', 'minimal', 'fancy'];

export class RankCardCommand extends BaseCommand {
  constructor() {
    super({
      name: 'rankcard',
      description: 'Customize your rank card appearance',
      category: 'leveling',
      premiumTier: 'silver',
      cooldown: 5,
      ownerOnly: false,
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['card', 'rankcustomize'],
      examples: [
        'p!rankcard color #ff0000',
        'p!rankcard bg https://example.com/bg.png',
        'p!rankcard style minimal',
        '/rankcard color #ff0000',
      ],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addSubcommand(s => s.setName('color').setDescription('Set rank card accent color')
        .addStringOption(o => o.setName('hex').setDescription('Hex color (e.g. #ff0000)').setRequired(true)))
      .addSubcommand(s => s.setName('bg').setDescription('Set rank card background image URL')
        .addStringOption(o => o.setName('url').setDescription('Image URL (leave empty to clear)').setRequired(false)))
      .addSubcommand(s => s.setName('style').setDescription('Set rank card style')
        .addStringOption(o => o.setName('style').setDescription('Style type').setRequired(true)
          .addChoices({ name: 'Default', value: 'default' }, { name: 'Minimal', value: 'minimal' }, { name: 'Fancy', value: 'fancy' })))
      .addSubcommand(s => s.setName('preview').setDescription('Preview your current rank card settings'))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  private isValidHex(hex: string): boolean {
    return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex);
  }

  private isValidUrl(url: string): boolean {
    try { new URL(url); return true; } catch { return false; }
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const sub = i.options.getSubcommand();
    const prisma = getPrismaClient();
    const userId = i.user.id;
    const guildId = i.guildId!;
    try {
      if (sub === 'color') {
        const hex = i.options.getString('hex', true);
        if (!this.isValidHex(hex)) { await i.reply({ content: `${EMOJIS.error} Invalid hex color. Use format #RRGGBB or #RGB.`, ephemeral: true }); return; }
        await prisma.leveling.upsert({ where: { userId_guildId: { userId, guildId } }, create: { userId, guildId, rankCardColor: hex }, update: { rankCardColor: hex } });
        await i.reply({ content: `${EMOJIS.success} Rank card color set to **${hex}**.`, ephemeral: true });
      } else if (sub === 'bg') {
        const url = i.options.getString('url');
        if (url && !this.isValidUrl(url)) { await i.reply({ content: `${EMOJIS.error} Invalid URL.`, ephemeral: true }); return; }
        await prisma.leveling.upsert({ where: { userId_guildId: { userId, guildId } }, create: { userId, guildId, rankCardBg: url ?? null }, update: { rankCardBg: url ?? null } });
        await i.reply({ content: url ? `${EMOJIS.success} Rank card background updated.` : `${EMOJIS.success} Background cleared.`, ephemeral: true });
      } else if (sub === 'style') {
        const style = i.options.getString('style', true);
        await prisma.leveling.upsert({ where: { userId_guildId: { userId, guildId } }, create: { userId, guildId, rankCardStyle: style }, update: { rankCardStyle: style } });
        await i.reply({ content: `${EMOJIS.success} Rank card style set to **${style}**.`, ephemeral: true });
      } else if (sub === 'preview') {
        const lv = await prisma.leveling.findUnique({ where: { userId_guildId: { userId, guildId } } });
        const embed = new EmbedBuilder()
          .setTitle(`🎴 ${i.user.username}'s Rank Card Settings`)
          .setColor(parseInt((lv?.rankCardColor ?? '#5865F2').replace('#', ''), 16))
          .addFields(
            { name: 'Color', value: lv?.rankCardColor ?? '#5865F2', inline: true },
            { name: 'Style', value: lv?.rankCardStyle ?? 'default', inline: true },
            { name: 'Background', value: lv?.rankCardBg ? '[Custom](' + lv.rankCardBg + ')' : 'None', inline: true },
          )
          .setThumbnail(i.user.displayAvatarURL({ size: 128 }));
        await i.reply({ embeds: [embed] });
      }
    } catch {
      await i.reply({ content: `${EMOJIS.error} Failed to update rank card settings.`, ephemeral: true });
    }
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    const sub = args[0]?.toLowerCase();
    const prisma = getPrismaClient();
    const userId = m.author.id;
    const guildId = m.guildId!;
    try {
      if (!sub || sub === 'preview') {
        const lv = await prisma.leveling.findUnique({ where: { userId_guildId: { userId, guildId } } });
        const embed = new EmbedBuilder()
          .setTitle(`🎴 ${m.author.username}'s Rank Card Settings`)
          .setColor(parseInt((lv?.rankCardColor ?? '#5865F2').replace('#', ''), 16))
          .addFields(
            { name: 'Color', value: lv?.rankCardColor ?? '#5865F2', inline: true },
            { name: 'Style', value: lv?.rankCardStyle ?? 'default', inline: true },
            { name: 'Background', value: lv?.rankCardBg ? '[Custom](' + lv.rankCardBg + ')' : 'None', inline: true },
          )
          .setThumbnail(m.author.displayAvatarURL({ size: 128 }));
        await m.reply({ embeds: [embed] });
      } else if (sub === 'color') {
        const hex = args[1];
        if (!hex || !this.isValidHex(hex)) { await m.reply(`${EMOJIS.error} Invalid hex. Usage: \`p!rankcard color #RRGGBB\``); return; }
        await prisma.leveling.upsert({ where: { userId_guildId: { userId, guildId } }, create: { userId, guildId, rankCardColor: hex }, update: { rankCardColor: hex } });
        await m.reply(`${EMOJIS.success} Rank card color set to **${hex}**.`);
      } else if (sub === 'bg') {
        const url = args[1];
        if (url && !this.isValidUrl(url)) { await m.reply(`${EMOJIS.error} Invalid URL.`); return; }
        await prisma.leveling.upsert({ where: { userId_guildId: { userId, guildId } }, create: { userId, guildId, rankCardBg: url ?? null }, update: { rankCardBg: url ?? null } });
        await m.reply(url ? `${EMOJIS.success} Background updated.` : `${EMOJIS.success} Background cleared.`);
      } else if (sub === 'style') {
        const style = args[1]?.toLowerCase();
        if (!style || !VALID_STYLES.includes(style)) { await m.reply(`${EMOJIS.error} Valid styles: ${VALID_STYLES.join(', ')}`); return; }
        await prisma.leveling.upsert({ where: { userId_guildId: { userId, guildId } }, create: { userId, guildId, rankCardStyle: style }, update: { rankCardStyle: style } });
        await m.reply(`${EMOJIS.success} Rank card style set to **${style}**.`);
      } else {
        await m.reply(`${EMOJIS.error} Usage: \`p!rankcard <color|bg|style|preview>\``);
      }
    } catch {
      await m.reply(`${EMOJIS.error} Failed to update rank card settings.`);
    }
  }
}
export default RankCardCommand;
