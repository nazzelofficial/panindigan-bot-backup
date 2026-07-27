// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { aiEngine } from '../../structures/AIEngine.js';
export class ImagineCommand extends BaseCommand {
    constructor() {
        super({ name: 'imagine', description: 'Generate an AI image using DALL-E 3', category: 'image', premiumTier: 'free', cooldown: 20, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['generate', 'imagine-ai', 'ai-image'], examples: ['/imagine a sunset over mountains', 'p!imagine a cute cat'] });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
            .addStringOption(o => o.setName('prompt').setDescription('What to generate').setRequired(true))
            .setDMPermission(false));
    }
    async executeSlash(i) {
        const prompt = i.options.getString('prompt', true);
        await i.deferReply();
        try {
            const result = await aiEngine.generateImage(prompt, { size: '1024x1024', quality: 'standard' });
            if (!result.imageUrl) {
                await i.editReply({ content: '❌ No image returned.' });
                return;
            }
            const embed = new EmbedBuilder().setTitle('🎨 AI Generated Image').setColor(COLORS.info)
                .setDescription(`**Prompt:** ${prompt}`)
                .setImage(result.imageUrl)
                .setFooter({ text: 'Generated with DALL-E 3' });
            await i.editReply({ embeds: [embed] });
        }
        catch (e) {
            await i.editReply({ content: `❌ ${e.message || 'Failed to generate image.'}` });
        }
    }
    async executePrefix(m, _args) {
        if (!args.length) {
            await m.reply('❌ Usage: `p!imagine <prompt>`');
            return;
        }
        const msg = await m.reply('⏳ Generating image...');
        try {
            const result = await aiEngine.generateImage(args.join(' '), { size: '1024x1024', quality: 'standard' });
            if (!result.imageUrl) {
                await msg.edit('❌ No image returned.');
                return;
            }
            const embed = new EmbedBuilder().setTitle('🎨 AI Image').setColor(COLORS.info).setImage(result.imageUrl).setDescription(`**Prompt:** ${args.join(' ')}`);
            await msg.edit({ content: '', embeds: [embed] });
        }
        catch (e) {
            await msg.edit(`❌ ${e.message || 'Error.'}`);
        }
    }
}
export default ImagineCommand;
