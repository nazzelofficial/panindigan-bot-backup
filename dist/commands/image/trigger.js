// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { createCanvas, loadImage } from 'canvas';
export class TriggerCommand extends BaseCommand {
    constructor() {
        super({ name: 'trigger', description: 'Put a "triggered" effect on someone\'s avatar', category: 'image', premiumTier: 'free', cooldown: 5, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['triggered'], examples: ['/trigger @user', 'p!trigger @user'] });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder().setName(this.name).setDescription(this.description).addUserOption(o => o.setName('user').setDescription('User to trigger').setRequired(false)).setDMPermission(false));
    }
    async executeSlash(i) {
        const target = i.options.getUser('user') || i.user;
        await i.deferReply();
        try {
            const avatarUrl = target.displayAvatarURL({ extension: 'png', size: 256 });
            const canvas = createCanvas(256, 310);
            const ctx = canvas.getContext('2d');
            const avatar = await loadImage(avatarUrl);
            const shakeX = Math.random() * 10 - 5;
            const shakeY = Math.random() * 10 - 5;
            ctx.drawImage(avatar, shakeX, shakeY, 256 + 10, 256 + 10);
            ctx.fillStyle = 'rgba(255, 0, 0, 0.4)';
            ctx.fillRect(0, 0, 256, 256);
            ctx.fillStyle = '#FF0000';
            ctx.font = 'bold 50px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('TRIGGERED', 128, 290);
            const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'triggered.png' });
            const embed = new EmbedBuilder().setColor(COLORS.error).setImage('attachment://triggered.png');
            await i.editReply({ embeds: [embed], files: [attachment] });
        }
        catch {
            await i.editReply({ content: '❌ Failed to generate triggered image.' });
        }
    }
    async executePrefix(m, _args) {
        const target = m.mentions.users.first() || m.author;
        try {
            const avatarUrl = target.displayAvatarURL({ extension: 'png', size: 256 });
            const canvas = createCanvas(256, 310);
            const ctx = canvas.getContext('2d');
            const avatar = await loadImage(avatarUrl);
            ctx.drawImage(avatar, 0, 0, 256, 256);
            ctx.fillStyle = 'rgba(255, 0, 0, 0.4)';
            ctx.fillRect(0, 0, 256, 256);
            ctx.fillStyle = '#FF0000';
            ctx.font = 'bold 50px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('TRIGGERED', 128, 290);
            const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'triggered.png' });
            await m.reply({ files: [attachment] });
        }
        catch {
            await m.reply('❌ Failed.');
        }
    }
}
export default TriggerCommand;
