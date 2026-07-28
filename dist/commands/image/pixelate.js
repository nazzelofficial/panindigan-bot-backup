// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import sharp from 'sharp';
export class PixelateCommand extends BaseCommand {
    constructor() {
        super({ name: 'pixelate', description: 'Pixelate a user\'s avatar', category: 'image', premiumTier: 'free', cooldown: 5, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['pixel', 'mosaic'], examples: ['/pixelate @user 8', 'p!pixelate @user 16'] });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
            .addUserOption(o => o.setName('user').setDescription('Target user').setRequired(false))
            .addIntegerOption(o => o.setName('size').setDescription('Pixel size 4-64').setRequired(false).setMinValue(4).setMaxValue(64))
            .setDMPermission(false));
    }
    async pixelate(avatarUrl, pixelSize) {
        const res = await fetch(avatarUrl);
        const buf = Buffer.from(await res.arrayBuffer());
        const smallSize = Math.max(4, Math.floor(512 / pixelSize));
        return sharp(buf).resize(smallSize, smallSize, { kernel: 'nearest' }).resize(512, 512, { kernel: 'nearest' }).toBuffer();
    }
    async executeSlash(i) {
        const target = i.options.getUser('user') || i.user;
        const size = i.options.getInteger('size') || 16;
        await i.deferReply();
        try {
            const buf = await this.pixelate(target.displayAvatarURL({ extension: 'png', size: 512 }), size);
            const embed = new EmbedBuilder().setColor(COLORS.default).setDescription(`🟦 Pixelated **${target.username}** (${size}px)`).setImage('attachment://pixelate.png');
            await i.editReply({ embeds: [embed], files: [new AttachmentBuilder(buf, { name: 'pixelate.png' })] });
        }
        catch {
            await i.editReply({ content: '❌ Failed.' });
        }
    }
    async executePrefix(m, _args) {
        const target = m.mentions.users.first() || m.author;
        const size = parseInt(args.find(a => /^\d+$/.test(a)) || '16') || 16;
        try {
            const buf = await this.pixelate(target.displayAvatarURL({ extension: 'png', size: 512 }), size);
            await m.reply({ files: [new AttachmentBuilder(buf, { name: 'pixelate.png' })] });
        }
        catch {
            await m.reply('❌ Failed.');
        }
    }
}
export default PixelateCommand;
