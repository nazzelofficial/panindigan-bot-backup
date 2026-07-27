// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import sharp from 'sharp';
import fetch from 'node-fetch';
export class BlurCommand extends BaseCommand {
    constructor() {
        super({ name: 'blur', description: 'Blur a user\'s avatar', category: 'image', premiumTier: 'free', cooldown: 5, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['blurred'], examples: ['/blur @user 5', 'p!blur @user 10'] });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
            .addUserOption(o => o.setName('user').setDescription('Target user').setRequired(false))
            .addIntegerOption(o => o.setName('intensity').setDescription('Blur intensity 1-20').setRequired(false).setMinValue(1).setMaxValue(20))
            .setDMPermission(false));
    }
    async process(avatarUrl, intensity) {
        const res = await fetch(avatarUrl);
        const arrayBuf = await res.arrayBuffer();
        const buf = Buffer.from(arrayBuf);
        return sharp(buf).blur(intensity).toBuffer();
    }
    async executeSlash(i) {
        const target = i.options.getUser('user') || i.user;
        const intensity = i.options.getInteger('intensity') || 5;
        await i.deferReply();
        try {
            const buf = await this.process(target.displayAvatarURL({ extension: 'png', size: 512 }), intensity);
            const embed = new EmbedBuilder().setColor(COLORS.default).setDescription(`🔵 Blur x${intensity}`).setImage('attachment://blur.png');
            await i.editReply({ embeds: [embed], files: [new AttachmentBuilder(buf, { name: 'blur.png' })] });
        }
        catch {
            await i.editReply({ content: '❌ Failed.' });
        }
    }
    async executePrefix(m, _args) {
        const target = m.mentions.users.first() || m.author;
        const intensity = parseInt(args.find(a => /^\d+$/.test(a)) || '5') || 5;
        try {
            const buf = await this.process(target.displayAvatarURL({ extension: 'png', size: 512 }), intensity);
            await m.reply({ files: [new AttachmentBuilder(buf, { name: 'blur.png' })] });
        }
        catch {
            await m.reply('❌ Failed.');
        }
    }
}
export default BlurCommand;
