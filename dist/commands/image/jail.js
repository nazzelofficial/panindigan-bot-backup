// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { createCanvas, loadImage } from 'canvas';
export class JailCommand extends BaseCommand {
    constructor() {
        super({ name: 'jail', description: 'Put someone in jail', category: 'image', premiumTier: 'free', cooldown: 5, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['prison', 'arrested'], examples: ['/jail @user', 'p!jail @user'] });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder().setName(this.name).setDescription(this.description).addUserOption(o => o.setName('user').setDescription('User to jail').setRequired(false)).setDMPermission(false));
    }
    async generate(avatarUrl) {
        const canvas = createCanvas(256, 256);
        const ctx = canvas.getContext('2d');
        const avatar = await loadImage(avatarUrl);
        ctx.drawImage(avatar, 0, 0, 256, 256);
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(0, 0, 256, 256);
        // Draw bars
        ctx.fillStyle = '#666666';
        for (let x = 0; x <= 256; x += 42) {
            ctx.fillRect(x, 0, 12, 256);
        }
        // Horizontal bar
        ctx.fillRect(0, 120, 256, 12);
        return canvas.toBuffer();
    }
    async executeSlash(i) {
        const target = i.options.getUser('user') || i.user;
        await i.deferReply();
        try {
            const buf = await this.generate(target.displayAvatarURL({ extension: 'png', size: 256 }));
            const attachment = new AttachmentBuilder(buf, { name: 'jail.png' });
            const embed = new EmbedBuilder().setColor(COLORS.default).setDescription(`🚔 **${target.username}** has been jailed!`).setImage('attachment://jail.png');
            await i.editReply({ embeds: [embed], files: [attachment] });
        }
        catch {
            await i.editReply({ content: '❌ Failed.' });
        }
    }
    async executePrefix(m, _args) {
        const target = m.mentions.users.first() || m.author;
        try {
            const buf = await this.generate(target.displayAvatarURL({ extension: 'png', size: 256 }));
            await m.reply({ content: `🚔 ${target.username} is in jail!`, files: [new AttachmentBuilder(buf, { name: 'jail.png' })] });
        }
        catch {
            await m.reply('❌ Failed.');
        }
    }
}
export default JailCommand;
