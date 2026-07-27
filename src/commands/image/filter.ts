// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import sharp from 'sharp';

const FILTERS: Record<string, (s: sharp.Sharp) => sharp.Sharp> = {
  sepia: (s) => s.modulate({ saturation: 0.5, brightness: 1.0 }).tint({ r: 112, g: 66, b: 20 }),
  vintage: (s) => s.modulate({ saturation: 0.7 }).gamma(2.2),
  cold: (s) => s.tint({ r: 100, g: 140, b: 200 }),
  warm: (s) => s.tint({ r: 255, g: 200, b: 150 }),
  purple: (s) => s.tint({ r: 150, g: 50, b: 200 }),
  neon: (s) => s.modulate({ saturation: 3.0, brightness: 1.2 }),
};

export class FilterCommand extends BaseCommand {
  constructor() {
    super({ name: 'filter', description: 'Apply a color filter to a user\'s avatar', category: 'image', premiumTier: 'free', cooldown: 5, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['colorfilter', 'imagefilter'], examples: ['/filter sepia @user', 'p!filter warm @user'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addStringOption(o => o.setName('filter').setDescription('Filter to apply').setRequired(true).addChoices(...Object.keys(FILTERS).map(k => ({ name: k.charAt(0).toUpperCase() + k.slice(1), value: k }))))
      .addUserOption(o => o.setName('user').setDescription('Target user').setRequired(false))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const filterName = i.options.getString('filter', true);
    const target = i.options.getUser('user') || i.user;
    await i.deferReply();
    try {
      const res = await fetch(target.displayAvatarURL({ extension: 'png', size: 512 }));
      const buf = Buffer.from(await res.arrayBuffer());
      const filterFn = FILTERS[filterName];
      const processed = await filterFn(sharp(buf)).toBuffer();
      const embed = new EmbedBuilder().setColor(COLORS.default).setDescription(`🎨 **${filterName}** filter on ${target.username}`).setImage('attachment://filter.png');
      await i.editReply({ embeds: [embed], files: [new AttachmentBuilder(processed, { name: 'filter.png' })] });
    } catch { await i.editReply({ content: '❌ Failed.' }); }
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    const filterName = args[0]?.toLowerCase();
    if (!filterName || !FILTERS[filterName]) { await m.reply(`❌ Valid filters: ${Object.keys(FILTERS).join(', ')}`); return; }
    const target = m.mentions.users.first() || m.author;
    try {
      const res = await fetch(target.displayAvatarURL({ extension: 'png', size: 512 }));
      const buf = Buffer.from(await res.arrayBuffer());
      const processed = await FILTERS[filterName](sharp(buf)).toBuffer();
      await m.reply({ content: `🎨 ${filterName}`, files: [new AttachmentBuilder(processed, { name: 'filter.png' })] });
    } catch { await m.reply('❌ Failed.'); }
  }
}
export default FilterCommand;
