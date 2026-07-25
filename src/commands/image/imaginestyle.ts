import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';
import { aiEngine } from '../../structures/AIEngine';

const STYLES: Record<string, string> = {
  anime: 'anime style, manga, cel-shaded, vibrant colors, Japanese animation',
  oilpainting: 'oil painting, thick brushstrokes, traditional art, museum quality, impressionist',
  watercolor: 'watercolor painting, soft washes, flowing colors, delicate, artistic',
  pixel: 'pixel art, 8-bit retro game style, pixelated, low resolution art',
  sketch: 'pencil sketch, hand-drawn, detailed linework, black and white illustration',
  neon: 'neon cyberpunk style, glowing lights, dark background, futuristic, synthwave',
  cinematic: 'cinematic photography, dramatic lighting, movie still, 4K, professional',
  vintage: 'vintage retro photograph, aged, sepia tones, old film grain, classic',
};

export class ImagineStyleCommand extends BaseCommand {
  constructor() {
    super({ name: 'imaginestyle', description: 'AI image with style transfer (Diamond) 🎭', category: 'image', premiumTier: 'diamond', cooldown: 30, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['aistyle', 'imagestyle', 'imagine-style'], examples: ['/imaginestyle anime a warrior princess', 'p!imaginestyle oilpainting a sunrise over mountains'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addStringOption(o => o.setName('style').setDescription('Art style to apply').setRequired(true)
        .addChoices(...Object.keys(STYLES).map(s => ({ name: s.charAt(0).toUpperCase() + s.slice(1), value: s }))))
      .addStringOption(o => o.setName('prompt').setDescription('What to generate').setRequired(true).setMaxLength(500))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const style = i.options.getString('style', true);
    const prompt = i.options.getString('prompt', true);
    const fullPrompt = `${prompt}, ${STYLES[style]}, highly detailed, high quality`;
    await i.deferReply();
    try {
      const result = await aiEngine.generateImage(fullPrompt, { size: '1024x1024', quality: 'hd', style: 'vivid' });
      if (!result.imageUrl) { await i.editReply({ content: '❌ No image returned.' }); return; }
      const embed = new EmbedBuilder()
        .setTitle(`🎭 Style Transfer — ${style.charAt(0).toUpperCase() + style.slice(1)}`)
        .setColor(COLORS.diamond)
        .setDescription(`**Prompt:** ${prompt}\n**Style:** ${style}`)
        .setImage(result.imageUrl)
        .setFooter({ text: 'Diamond • Style Transfer • DALL-E 3' })
        .setTimestamp();
      await i.editReply({ embeds: [embed] });
    } catch (e: any) {
      await i.editReply({ content: `❌ ${e.message || 'Failed to generate styled image.'}` });
    }
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    const style = args[0]?.toLowerCase();
    if (!style || !STYLES[style]) {
      const list = Object.keys(STYLES).join(', ');
      await m.reply(`❌ Usage: \`p!imaginestyle <style> <prompt>\`\n**Styles:** ${list}`);
      return;
    }
    const prompt = args.slice(1).join(' ');
    if (!prompt) { await m.reply('❌ Provide a prompt after the style.'); return; }
    const msg = await m.reply('⏳ Generating styled image...');
    try {
      const result = await aiEngine.generateImage(`${prompt}, ${STYLES[style]}`, { size: '1024x1024', quality: 'hd', style: 'vivid' });
      if (!result.imageUrl) { await msg.edit('❌ No image returned.'); return; }
      const embed = new EmbedBuilder()
        .setTitle(`🎭 Style Transfer — ${style}`).setColor(COLORS.diamond).setImage(result.imageUrl)
        .setDescription(`**Prompt:** ${prompt}`).setFooter({ text: 'Diamond • Style Transfer' });
      await msg.edit({ content: '', embeds: [embed] });
    } catch (e: any) {
      await msg.edit(`❌ ${e.message || 'Error.'}`);
    }
  }
}
export default ImagineStyleCommand;
