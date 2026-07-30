// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import {
  ChatInputCommandInteraction, Message, AttachmentBuilder, SlashCommandBuilder,
} from 'discord.js';
import { PanindiganClient } from '../../structures/PanindiganClient.js';
import { EmbedManager } from '../../structures/EmbedManager.js';
import { ErrorHandler } from '../../handlers/ErrorHandler.js';
import { loggers } from '../../utils/Logger.js';

export class ImageCommand extends BaseCommand {
  constructor() {
    super({ name: 'image', description: 'Generate images and apply image effects', category: 'image', premiumTier: 'gold', cooldown: 10, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['img', 'generate', 'imagegen'], examples: ['/image generate a cute cat', '/image avatar @user', '/image blur @user'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addSubcommand(s => s.setName('generate').setDescription('Generate an AI image with DALL·E').addStringOption(o => o.setName('prompt').setDescription('What to generate').setRequired(true)).addStringOption(o => o.setName('style').setDescription('Image style').setRequired(false).addChoices({ name: 'Natural', value: 'natural' }, { name: 'Vivid', value: 'vivid' })))
      .addSubcommand(s => s.setName('avatar').setDescription('Show a user\'s avatar').addUserOption(o => o.setName('user').setDescription('Target user').setRequired(false)))
      .addSubcommand(s => s.setName('banner').setDescription('Show a user\'s banner').addUserOption(o => o.setName('user').setDescription('Target user').setRequired(false)))
      .addSubcommand(s => s.setName('circle').setDescription('Apply circle crop to avatar').addUserOption(o => o.setName('user').setDescription('Target user').setRequired(false)))
      .addSubcommand(s => s.setName('blur').setDescription('Blur an avatar').addUserOption(o => o.setName('user').setDescription('Target user').setRequired(false)).addIntegerOption(o => o.setName('sigma').setDescription('Blur amount (1-20)').setRequired(false).setMinValue(1).setMaxValue(20)))
      .addSubcommand(s => s.setName('greyscale').setDescription('Convert avatar to greyscale').addUserOption(o => o.setName('user').setDescription('Target user').setRequired(false)))
      .addSubcommand(s => s.setName('invert').setDescription('Invert avatar colors').addUserOption(o => o.setName('user').setDescription('Target user').setRequired(false)))
      .addSubcommand(s => s.setName('flip').setDescription('Flip avatar').addUserOption(o => o.setName('user').setDescription('Target user').setRequired(false)))) as SlashCommandBuilder;
  }

  private async fetchAvatarBuffer(user: any): Promise<Buffer> {
    const url = user.displayAvatarURL({ extension: 'png', size: 512 });
    const response = await fetch(url);
    return Buffer.from(await response.arrayBuffer());
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const sub = i.options.getSubcommand();
    const client = i.client as PanindiganClient;

    await i.deferReply();

    try {
      if (sub === 'generate') {
        const prompt = i.options.getString('prompt', true);
        const style = (i.options.getString('style') || 'vivid') as 'vivid' | 'natural';

        // Use OpenAI DALL-E
        const { OpenAI } = await import('openai');
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const result = await openai.images.generate({
          model: 'dall-e-3',
          prompt,
          n: 1,
          size: '1024x1024',
          style,
        });
        const imageUrl = result.data[0]?.url;
        if (!imageUrl) { await ErrorHandler.generic(i, 'Failed to generate image.'); return; }
        const embed = EmbedManager.ai('Generated Image')
          .setDescription(`🎨 **Generated Image**\nPrompt: *${prompt}*\n${imageUrl}`);
        await i.editReply({ embeds: [embed] });

      } else if (sub === 'avatar') {
        const target = i.options.getUser('user') || i.user;
        const url = target.displayAvatarURL({ extension: 'png', size: 4096, forceStatic: false });
        const embed = EmbedManager.image('Avatar')
          .setDescription(`🖼️ **${target.username}'s Avatar**\n${url}`);
        await i.editReply({ embeds: [embed] });

      } else if (sub === 'banner') {
        const target = await (i.options.getUser('user') || i.user).fetch();
        const bannerUrl = (target as any).bannerURL?.({ extension: 'png', size: 4096 });
        if (!bannerUrl) { await ErrorHandler.generic(i, 'This user has no banner.'); return; }
        const embed = EmbedManager.image('Banner')
          .setDescription(`🖼️ **${target.username}'s Banner**\n${bannerUrl}`);
        await i.editReply({ embeds: [embed] });

      } else {
        // Sharp-based image processing
        const sharp = (await import('sharp')).default;
        const target = i.options.getUser('user') || i.user;
        let buf = await this.fetchAvatarBuffer(target);
        let img = sharp(buf);

        if (sub === 'circle') {
          const meta = await img.metadata();
          const size = Math.min(meta.width || 512, meta.height || 512);
          const mask = Buffer.from(`<svg><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}"/></svg>`);
          img = sharp(await img.resize(size, size).png().toBuffer())
            .composite([{ input: mask, blend: 'dest-in' }]);
        } else if (sub === 'blur') {
          const sigma = i.options.getInteger('sigma') || 5;
          img = img.blur(sigma);
        } else if (sub === 'greyscale') {
          img = img.greyscale();
        } else if (sub === 'invert') {
          img = img.negate();
        } else if (sub === 'flip') {
          img = img.flop();
        }

        const output = await img.png().toBuffer();
        const attachment = new AttachmentBuilder(output, { name: `${sub}_${target.id}.png` });
        await i.editReply({ files: [attachment] });
      }
    } catch (error: any) {
      loggers.commands.error('Image command error', {
        command: 'image',
        guild: i.guildId ?? undefined,
        user: i.user?.id,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      await ErrorHandler.generic(i, `Failed to process image: ${error.message || 'Unknown error'}`);
    }
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    await ErrorHandler.invalidArgument(m, 'Please use `/image` slash commands for image generation.');
  }
}
export default ImageCommand;
