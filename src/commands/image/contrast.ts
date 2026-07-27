// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import sharp from 'sharp';

export class ContrastCommand extends BaseCommand {
  constructor() {
    super({ name: 'contrast', description: 'Adjust contrast and brightness of an image', category: 'image', premiumTier: 'gold', cooldown: 5, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: [], examples: [] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addUserOption(o => o.setName('user').setDescription('Target user').setRequired(false))
      .addIntegerOption(o => o.setName('intensity').setDescription('Contrast intensity (1-3)').setMinValue(1).setMaxValue(3).setRequired(false))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  private async process(avatarUrl: string, intensity: number = 2): Promise<Buffer> {
    const res = await fetch(avatarUrl);
    const buf = Buffer.from(await res.arrayBuffer());
    const contrast = intensity === 1 ? 1.2 : intensity === 3 ? 2.0 : 1.5;
    return sharp(buf).linear(contrast, -(128 * contrast) + 128).toBuffer();
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const target = i.options.getUser('user') || i.user;
    const intensity = i.options.getInteger('intensity') ?? 2;
    await i.deferReply();
    try {
      const buf = await this.process(target.displayAvatarURL({ extension: 'png', size: 512 }), intensity);
      const embed = new EmbedBuilder()
        .setColor(COLORS.default)
        .setDescription(`Contrast adjusted (intensity: ${intensity})`)
        .setImage('attachment://result.png');
      await i.editReply({ embeds: [embed], files: [new AttachmentBuilder(buf, { name: 'result.png' })] });
    } catch {
      await i.editReply({ content: '❌ Failed to process image.' });
    }
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    const target = m.mentions.users.first() || m.author;
    const intensity = args[1] ? Math.min(3, Math.max(1, parseInt(args[1]) || 2)) : 2;
    try {
      const buf = await this.process(target.displayAvatarURL({ extension: 'png', size: 512 }), intensity);
      await m.reply({ files: [new AttachmentBuilder(buf, { name: 'result.png' })] });
    } catch {
      await m.reply('❌ Failed.');
    }
  }
}

export default ContrastCommand;
