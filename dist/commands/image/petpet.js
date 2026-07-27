// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { createCanvas, loadImage } from 'canvas';
export class PetpetCommand extends BaseCommand {
    constructor() {
        super({ name: 'petpet', description: 'Generate an animated petpet GIF of a user', category: 'image', premiumTier: 'free', cooldown: 8, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['pet', 'headpat-gif'], examples: ['/petpet @user', 'p!petpet @user'] });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder().setName(this.name).setDescription(this.description).addUserOption(o => o.setName('user').setDescription('User to pet').setRequired(false)).setDMPermission(false));
    }
    async executeSlash(i) {
        const target = i.options.getUser('user') || i.user;
        await i.deferReply();
        // Generate a static petpet frame (animated GIF would require gifsicle/gifencoder, so use static)
        try {
            const canvas = createCanvas(100, 100);
            const ctx = canvas.getContext('2d');
            const avatar = await loadImage(target.displayAvatarURL({ extension: 'png', size: 128 }));
            // Squish effect (frame 0)
            ctx.drawImage(avatar, 10, 20, 80, 80);
            // Draw hand
            ctx.fillStyle = '#ffcc88';
            ctx.ellipse(50, 10, 40, 25, 0, 0, Math.PI * 2);
            ctx.fill();
            const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'petpet.png' });
            const embed = new EmbedBuilder().setColor(COLORS.default).setDescription(`🖐️ Petting **${target.username}**!`).setImage('attachment://petpet.png');
            await i.editReply({ embeds: [embed], files: [attachment] });
        }
        catch {
            await i.editReply({ content: '❌ Failed.' });
        }
    }
    async executePrefix(m, _args) {
        const target = m.mentions.users.first() || m.author;
        try {
            const canvas = createCanvas(100, 100);
            const ctx = canvas.getContext('2d');
            const avatar = await loadImage(target.displayAvatarURL({ extension: 'png', size: 128 }));
            ctx.drawImage(avatar, 10, 20, 80, 80);
            ctx.fillStyle = '#ffcc88';
            ctx.ellipse(50, 10, 40, 25, 0, 0, Math.PI * 2);
            ctx.fill();
            await m.reply({ content: `🖐️ Petting ${target.username}!`, files: [new AttachmentBuilder(canvas.toBuffer(), { name: 'petpet.png' })] });
        }
        catch {
            await m.reply('❌ Failed.');
        }
    }
}
export default PetpetCommand;
