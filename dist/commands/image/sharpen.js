// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import sharp from 'sharp';
export class SharpenCommand extends BaseCommand {
    constructor() {
        super({ name: 'sharpen', description: 'Sharpen a blurry image ✨', category: 'image', premiumTier: 'gold', cooldown: 5, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: [], examples: [] });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption(o => o.setName('user').setDescription('Target user').setRequired(false))
            .setDMPermission(false));
    }
    async process(avatarUrl) {
        const res = await fetch(avatarUrl);
        const buf = Buffer.from(await res.arrayBuffer());
        const sigma = 1.5;
        const flat = 0.5;
        const jagged = 2.0;
        return sharp(buf).sharpen({ sigma, m1: flat, m2: jagged }).toBuffer();
    }
    async executeSlash(i) {
        const target = i.options.getUser('user') || i.user;
        await i.deferReply();
        try {
            const buf = await this.process(target.displayAvatarURL({ extension: 'png', size: 512 }));
            const embed = new EmbedBuilder()
                .setColor(COLORS.default)
                .setDescription('Image sharpened ✨')
                .setImage('attachment://result.png');
            await i.editReply({ embeds: [embed], files: [new AttachmentBuilder(buf, { name: 'result.png' })] });
        }
        catch {
            await i.editReply({ content: '❌ Failed to process image.' });
        }
    }
    async executePrefix(m, _args) {
        const target = m.mentions.users.first() || m.author;
        try {
            const buf = await this.process(target.displayAvatarURL({ extension: 'png', size: 512 }));
            await m.reply({ files: [new AttachmentBuilder(buf, { name: 'result.png' })] });
        }
        catch {
            await m.reply('❌ Failed.');
        }
    }
}
export default SharpenCommand;
