// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { aiEngine } from '../../structures/AIEngine.js';

export class ImagineHdCommand extends BaseCommand {
  constructor() {
    super({ name: 'imaginehd', description: 'Generate an HD AI image (Silver+) 🎨', category: 'image', premiumTier: 'silver', cooldown: 30, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['hdimagine', 'aiimghd', 'imagine-hd'], examples: ['/imaginehd a majestic dragon', 'p!imaginehd a neon cityscape'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addStringOption(o => o.setName('prompt').setDescription('What to generate in HD').setRequired(true).setMaxLength(1000))
      .addStringOption(o => o.setName('style').setDescription('Image style').setRequired(false)
        .addChoices(
          { name: 'Natural', value: 'natural' },
          { name: 'Vivid', value: 'vivid' },
        ))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const prompt = i.options.getString('prompt', true);
    const style = (i.options.getString('style') || 'vivid') as 'natural' | 'vivid';
    await i.deferReply();
    try {
      const result = await aiEngine.generateImage(prompt, { size: '1792x1024', quality: 'hd', style });
      if (!result.imageUrl) { await i.editReply({ content: '❌ No image returned.' }); return; }
      const embed = new EmbedBuilder()
        .setTitle('🎨 HD AI Image')
        .setColor(COLORS.silver)
        .setDescription(`**Prompt:** ${prompt}`)
        .setImage(result.imageUrl)
        .setFooter({ text: `HD • ${style} style • DALL-E 3 • Silver Premium` })
        .setTimestamp();
      await i.editReply({ embeds: [embed] });
    } catch (e: any) {
      await i.editReply({ content: `❌ ${e.message || 'Failed to generate HD image.'}` });
    }
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    if (!args.length) { await m.reply('❌ Usage: `p!imaginehd <prompt>`'); return; }
    const msg = await m.reply('⏳ Generating HD image...');
    try {
      const result = await aiEngine.generateImage(args.join(' '), { size: '1792x1024', quality: 'hd', style: 'vivid' });
      if (!result.imageUrl) { await msg.edit('❌ No image returned.'); return; }
      const embed = new EmbedBuilder()
        .setTitle('🎨 HD AI Image').setColor(COLORS.silver).setImage(result.imageUrl)
        .setDescription(`**Prompt:** ${args.join(' ')}`)
        .setFooter({ text: 'HD • DALL-E 3 • Silver Premium' });
      await msg.edit({ content: '', embeds: [embed] });
    } catch (e: any) {
      await msg.edit(`❌ ${e.message || 'Error.'}`);
    }
  }
}
export default ImagineHdCommand;
