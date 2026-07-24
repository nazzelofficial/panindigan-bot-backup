import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class ColorCommand extends BaseCommand {
  constructor() {
    super({
      name: 'color',
      description: 'Shows color preview and hex/rgb/decimal values for a hex color code',
      category: 'utility',
      premiumTier: 'free',
      cooldown: 5,
      ownerOnly: false,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['colour'],
      examples: ['p!color #5865F2', 'p!color 5865F2'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .setDMPermission(false)
      .addStringOption(opt =>
        opt.setName('hex').setDescription('Hex color code (e.g. #5865F2 or 5865F2)').setRequired(true)
      ) as SlashCommandBuilder;
  }

  private parseHex(input: string): { hex: string; decimal: number; r: number; g: number; b: number } | null {
    const cleaned = input.replace(/^#/, '').trim();
    if (!/^[0-9A-Fa-f]{6}$/.test(cleaned)) return null;
    const decimal = parseInt(cleaned, 16);
    const r = (decimal >> 16) & 0xff;
    const g = (decimal >> 8) & 0xff;
    const b = decimal & 0xff;
    return { hex: `#${cleaned.toUpperCase()}`, decimal, r, g, b };
  }

  private buildEmbed(hex: string, r: number, g: number, b: number, decimal: number): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle(`${EMOJIS.utility} Color Preview`)
      .setColor(decimal)
      .addFields(
        { name: 'Hex', value: `\`${hex}\``, inline: true },
        { name: 'RGB', value: `\`rgb(${r}, ${g}, ${b})\``, inline: true },
        { name: 'Decimal', value: `\`${decimal}\``, inline: true },
      )
      .setThumbnail(`https://singlecolorimage.com/get/${hex.replace('#', '')}/128x128`)
      .setTimestamp();
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    try {
      const input = i.options.getString('hex', true);
      const parsed = this.parseHex(input);
      if (!parsed) {
        await i.reply({
          embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`${EMOJIS.error} Invalid hex color code. Use a 6-digit hex like \`#5865F2\`.`)],
          ephemeral: true,
        });
        return;
      }
      await i.reply({ embeds: [this.buildEmbed(parsed.hex, parsed.r, parsed.g, parsed.b, parsed.decimal)] });
    } catch (err) {
      await i.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`${EMOJIS.error} An error occurred.`)], ephemeral: true });
    }
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    try {
      if (!args[0]) {
        await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`${EMOJIS.error} Please provide a hex color code.\nExample: \`p!color #5865F2\``)] });
        return;
      }
      const parsed = this.parseHex(args[0]);
      if (!parsed) {
        await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`${EMOJIS.error} Invalid hex color code. Use a 6-digit hex like \`#5865F2\`.`)] });
        return;
      }
      await m.reply({ embeds: [this.buildEmbed(parsed.hex, parsed.r, parsed.g, parsed.b, parsed.decimal)] });
    } catch (err) {
      await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`${EMOJIS.error} An error occurred.`)] });
    }
  }
}

export default ColorCommand;
