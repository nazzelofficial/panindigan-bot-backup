import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

type ConversionFn = (v: number) => number;

interface ConversionPair {
  fn: ConversionFn;
  label: string;
}

const CONVERSIONS: Record<string, Record<string, ConversionPair>> = {
  km: {
    mi: { fn: (v) => v * 0.621371, label: 'mi' },
    m: { fn: (v) => v * 1000, label: 'm' },
  },
  mi: {
    km: { fn: (v) => v * 1.60934, label: 'km' },
  },
  kg: {
    lb: { fn: (v) => v * 2.20462, label: 'lb' },
    g: { fn: (v) => v * 1000, label: 'g' },
  },
  lb: {
    kg: { fn: (v) => v * 0.453592, label: 'kg' },
  },
  cm: {
    in: { fn: (v) => v * 0.393701, label: 'in' },
    m: { fn: (v) => v / 100, label: 'm' },
  },
  in: {
    cm: { fn: (v) => v * 2.54, label: 'cm' },
  },
  celsius: {
    fahrenheit: { fn: (v) => (v * 9) / 5 + 32, label: '°F' },
    kelvin: { fn: (v) => v + 273.15, label: 'K' },
  },
  fahrenheit: {
    celsius: { fn: (v) => ((v - 32) * 5) / 9, label: '°C' },
  },
  l: {
    gal: { fn: (v) => v * 0.264172, label: 'gal' },
    ml: { fn: (v) => v * 1000, label: 'mL' },
  },
  gal: {
    l: { fn: (v) => v * 3.78541, label: 'L' },
  },
  m: {
    ft: { fn: (v) => v * 3.28084, label: 'ft' },
    cm: { fn: (v) => v * 100, label: 'cm' },
    km: { fn: (v) => v / 1000, label: 'km' },
  },
  ft: {
    m: { fn: (v) => v * 0.3048, label: 'm' },
  },
};

export class ConvertCommand extends BaseCommand {
  constructor() {
    super({
      name: 'convert',
      description: 'Convert between units (km/mi, kg/lb, cm/in, celsius/fahrenheit, L/gal)',
      category: 'utility',
      premiumTier: 'bronze',
      cooldown: 5,
      ownerOnly: false,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['conv', 'unit'],
      examples: ['p!convert 100 km mi', 'p!convert 37 celsius fahrenheit', 'p!convert 5 kg lb'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .setDMPermission(false)
      .addNumberOption(opt => opt.setName('value').setDescription('Value to convert').setRequired(true))
      .addStringOption(opt => opt.setName('from').setDescription('From unit (e.g. km, kg, celsius)').setRequired(true))
      .addStringOption(opt => opt.setName('to').setDescription('To unit (e.g. mi, lb, fahrenheit)').setRequired(true)) as SlashCommandBuilder;
  }

  private convert(value: number, from: string, to: string): EmbedBuilder {
    const fromKey = from.toLowerCase();
    const toKey = to.toLowerCase();

    const fromMap = CONVERSIONS[fromKey];
    if (!fromMap) {
      const supported = Object.keys(CONVERSIONS).join(', ');
      return new EmbedBuilder().setColor(COLORS.error).setDescription(`${EMOJIS.error} Unknown unit \`${from}\`.\nSupported: ${supported}`);
    }
    const conversion = fromMap[toKey];
    if (!conversion) {
      const available = Object.keys(fromMap).join(', ');
      return new EmbedBuilder().setColor(COLORS.error).setDescription(`${EMOJIS.error} Cannot convert \`${from}\` to \`${to}\`.\nFrom \`${from}\` you can convert to: ${available}`);
    }

    const result = conversion.fn(value);
    return new EmbedBuilder()
      .setTitle(`${EMOJIS.utility} Unit Conversion`)
      .setColor(COLORS.default)
      .addFields(
        { name: 'Input', value: `\`${value} ${from}\``, inline: true },
        { name: 'Result', value: `\`${parseFloat(result.toFixed(6))} ${conversion.label}\``, inline: true },
      )
      .setTimestamp();
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    try {
      const value = i.options.getNumber('value', true);
      const from = i.options.getString('from', true);
      const to = i.options.getString('to', true);
      await i.reply({ embeds: [this.convert(value, from, to)] });
    } catch (err) {
      await i.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`${EMOJIS.error} An error occurred.`)], ephemeral: true });
    }
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    try {
      if (args.length < 3) {
        await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`${EMOJIS.error} Usage: \`p!convert <value> <from> <to>\`\nExample: \`p!convert 100 km mi\``)] });
        return;
      }
      const value = parseFloat(args[0]);
      if (isNaN(value)) {
        await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`${EMOJIS.error} Invalid number: \`${args[0]}\``)] });
        return;
      }
      await m.reply({ embeds: [this.convert(value, args[1], args[2])] });
    } catch (err) {
      await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`${EMOJIS.error} An error occurred.`)] });
    }
  }
}

export default ConvertCommand;
