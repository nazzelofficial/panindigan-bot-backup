// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { aiEngine } from '../../structures/AIEngine.js';

export class HdImageCommand extends BaseCommand {
  constructor() {
    super({ name: 'hdimage', description: 'Generate a high-definition AI image (Diamond perk)', category: 'premium', premiumTier: 'diamond', cooldown: 30, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['hd-image', 'imagine-hd', 'imagehd'], examples: ['/hdimage a majestic dragon', 'p!hdimage a city at night'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addStringOption(o => o.setName('prompt').setDescription('What to generate').setRequired(true))
      .addStringOption(o => o.setName('style').setDescription('Image style').setRequired(false).addChoices({ name: 'Vivid', value: 'vivid' }, { name: 'Natural', value: 'natural' }))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const prompt = i.options.getString('prompt', true);
    const style = i.options.getString('style') || 'vivid';
    await i.deferReply();

    try {
      const result = await aiEngine.generateImage(prompt, { size: '1792x1024', quality: 'hd', style: style as 'vivid' | 'natural' });
      if (!result.imageUrl) { await i.editReply({ content: '❌ Failed to generate image.' }); return; }
      const embed = new EmbedBuilder().setTitle('🖼️ HD AI Image').setColor(COLORS.diamond)
        .setDescription(`**Prompt:** ${prompt}`)
        .setImage(result.imageUrl)
        .setFooter({ text: 'Diamond Premium Perk | DALL-E 3 HD' });
      await i.editReply({ embeds: [embed] });
    } catch (error: any) {
      await i.editReply({ content: `❌ ${error.message || 'Failed to generate image.'}` });
    }
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    if (!args.length) { await m.reply('❌ Usage: `p!hdimage <prompt>`'); return; }
    const prompt = args.join(' ');
    const msg = await m.reply('⏳ Generating HD image...');
    try {
      const result = await aiEngine.generateImage(prompt, { size: '1792x1024', quality: 'hd' });
      if (!result.imageUrl) { await msg.edit('❌ Failed to generate image.'); return; }
      const embed = new EmbedBuilder().setTitle('🖼️ HD AI Image').setColor(COLORS.diamond).setDescription(`**Prompt:** ${prompt}`).setImage(result.imageUrl);
      await msg.edit({ content: '', embeds: [embed] });
    } catch (e: any) {
      await msg.edit(`❌ ${e.message || 'Error.'}`);
    }
  }
}
export default HdImageCommand;
