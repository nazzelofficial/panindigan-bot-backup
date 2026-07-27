// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { createCanvas, loadImage } from 'canvas';
export class StickerCommand extends BaseCommand {
    constructor() {
        super({ name: 'sticker', description: 'Create a custom Discord sticker from an avatar (Diamond) 🎨', category: 'image', premiumTier: 'diamond', cooldown: 15, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['makesticker', 'createsticker'], examples: ['/sticker create @user', 'p!sticker create @user My Sticker'] });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
            .addSubcommand(s => s.setName('create').setDescription('Create a custom sticker image')
            .addUserOption(o => o.setName('user').setDescription('Target user (default: yourself)').setRequired(false))
            .addStringOption(o => o.setName('text').setDescription('Text overlay on sticker').setRequired(false).setMaxLength(30))
            .addStringOption(o => o.setName('style').setDescription('Sticker style').setRequired(false)
            .addChoices({ name: 'Circle', value: 'circle' }, { name: 'Square', value: 'square' }, { name: 'Heart', value: 'heart' }, { name: 'Star', value: 'star' })))
            .setDMPermission(false));
    }
    async handle(avatarUrl, text, style, send) {
        const size = 512;
        const canvas = createCanvas(size, size);
        const ctx = canvas.getContext('2d');
        // Transparent background
        ctx.clearRect(0, 0, size, size);
        const img = await loadImage(avatarUrl);
        ctx.save();
        if (style === 'circle') {
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, size / 2 - 10, 0, Math.PI * 2);
            ctx.clip();
        }
        else if (style === 'heart') {
            const x = size / 2, y = size / 2 - 30;
            ctx.beginPath();
            ctx.moveTo(x, y + 80);
            ctx.bezierCurveTo(x + 200, y - 60, x + 250, y + 100, x, y + 220);
            ctx.bezierCurveTo(x - 250, y + 100, x - 200, y - 60, x, y + 80);
            ctx.clip();
        }
        else if (style === 'star') {
            const cx = size / 2, cy = size / 2, spikes = 5, outerR = size / 2 - 10, innerR = outerR * 0.45;
            ctx.beginPath();
            for (let i = 0; i < spikes * 2; i++) {
                const r = i % 2 === 0 ? outerR : innerR;
                const angle = (Math.PI / spikes) * i - Math.PI / 2;
                i === 0 ? ctx.moveTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle)) : ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
            }
            ctx.closePath();
            ctx.clip();
        }
        ctx.drawImage(img, 10, 10, size - 20, size - 20);
        ctx.restore();
        // Border
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 8;
        if (style === 'circle') {
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, size / 2 - 10, 0, Math.PI * 2);
            ctx.stroke();
        }
        else {
            ctx.strokeRect(10, 10, size - 20, size - 20);
        }
        // Text overlay
        if (text) {
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(0, size - 70, size, 70);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 32px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(text, size / 2, size - 30);
        }
        const buf = canvas.toBuffer('image/png');
        const embed = new EmbedBuilder()
            .setTitle('🎨 Custom Sticker Created!')
            .setDescription(`Style: **${style}**${text ? `\nText: **${text}**` : ''}\n\nSave this image and upload it as a Discord sticker in Server Settings → Emoji.`)
            .setColor(COLORS.diamond)
            .setImage('attachment://sticker.png')
            .setFooter({ text: 'Diamond • Panindigan Image' });
        await send({ embeds: [embed], files: [new AttachmentBuilder(buf, { name: 'sticker.png' })] });
    }
    async executeSlash(i) {
        const sub = i.options.getSubcommand(false) || 'create';
        if (sub !== 'create') {
            await i.reply({ content: '❌ Use `/sticker create`', ephemeral: true });
            return;
        }
        const user = i.options.getUser('user') || i.user;
        const text = i.options.getString('text');
        const style = i.options.getString('style') || 'circle';
        await i.deferReply();
        try {
            await this.handle(user.displayAvatarURL({ extension: 'png', size: 512 }), text, style, (c) => i.editReply(c));
        }
        catch (e) {
            await i.editReply({ content: `❌ Failed: ${e.message}` });
        }
    }
    async executePrefix(m, _args) {
        const user = m.mentions.users.first() || m.author;
        const style = _args.find(a => ['circle', 'square', 'heart', 'star'].includes(a)) || 'circle';
        const text = _args.filter(a => !['circle', 'square', 'heart', 'star', 'create'].includes(a) && !/^<@/.test(a)).join(' ') || null;
        try {
            await this.handle(user.displayAvatarURL({ extension: 'png', size: 512 }), text, style, (c) => m.reply(c));
        }
        catch (e) {
            await m.reply(`❌ Failed: ${e.message}`);
        }
    }
}
export default StickerCommand;
