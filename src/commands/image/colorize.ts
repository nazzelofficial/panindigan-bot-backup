// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import sharp from 'sharp';

type ColorOption = 'blue' | 'red' | 'green' | 'gold' | 'purple';

const COLOR_MAP: Record<ColorOption, { r: number; g: number; b: number }> = {
  blue:   { r: 100, g: 150, b: 200 },
  red:    { r: 200, g: 80,  b: 80  },
  green:  { r: 80,  g: 200, b: 100 },
  gold:   { r: 220, g: 180, b: 50  },
  purple: { r: 150, g: 80,  b: 200 },
};

export class ColorizeCommand extends BaseCommand {
  constructor() {
    super({ name: 'colorize', description: 'Colorize a grayscale image 🎨', category: 'image', premiumTier: 'gold', cooldown: 5, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: [], examples: [] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addUserOption(o => o.setName('user').setDescription('Target user').setRequired(false))
      .addStringOption(o =>
        o.setName('color')
          .setDescription('Tint color to apply')
          .setRequired(false)
          .addChoices(
            { name: 'Blue', value: 'blue' },
            { name: 'Red', value: 'red' },
            { name: 'Green', value: 'green' },
            { name: 'Gold', value: 'gold' },
            { name: 'Purple', value: 'purple' },
          ))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  private async process(avatarUrl: string, color: ColorOption = 'blue'): Promise<Buffer> {
    const res = await fetch(avatarUrl);
    const buf = Buffer.from(await res.arrayBuffer());
    const tint = COLOR_MAP[color];
    return sharp(buf).grayscale().tint(tint).toBuffer();
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const target = i.options.getUser('user') || i.user;
    const color = (i.options.getString('color') ?? 'blue') as ColorOption;
    await i.deferReply();
    try {
      const buf = await this.process(target.displayAvatarURL({ extension: 'png', size: 512 }), color);
      const embed = new EmbedBuilder()
        .setColor(COLORS.default)
        .setDescription(`Image colorized with **${color}** tint 🎨`)
        .setImage('attachment://result.png');
      await i.editReply({ embeds: [embed], files: [new AttachmentBuilder(buf, { name: 'result.png' })] });
    } catch {
      await i.editReply({ content: '❌ Failed to process image.' });
    }
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    const target = m.mentions.users.first() || m.author;
    const colorArg = _args.find(a => Object.keys(COLOR_MAP).includes(a)) as ColorOption | undefined;
    const color: ColorOption = colorArg ?? 'blue';
    try {
      const buf = await this.process(target.displayAvatarURL({ extension: 'png', size: 512 }), color);
      await m.reply({ files: [new AttachmentBuilder(buf, { name: 'result.png' })] });
    } catch {
      await m.reply('❌ Failed.');
    }
  }
}

export default ColorizeCommand;
