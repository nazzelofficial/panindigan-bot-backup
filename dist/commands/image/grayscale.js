// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import sharp from 'sharp';
export class GrayscaleCommand extends BaseCommand {
    constructor() {
        super({ name: 'grayscale', description: 'Convert a user\'s avatar to grayscale', category: 'image', premiumTier: 'free', cooldown: 5, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['greyscale', 'bw', 'blackwhite'], examples: ['/grayscale @user', 'p!grayscale @user'] });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder().setName(this.name).setDescription(this.description).addUserOption(o => o.setName('user').setDescription('Target user').setRequired(false)).setDMPermission(false));
    }
    async executeSlash(i) {
        const target = i.options.getUser('user') || i.user;
        await i.deferReply();
        try {
            const res = await fetch(target.displayAvatarURL({ extension: 'png', size: 512 }));
            const buf = Buffer.from(await res.arrayBuffer());
            const processed = await sharp(buf).grayscale().toBuffer();
            const embed = new EmbedBuilder().setColor(COLORS.default).setDescription(`⬛ ${target.username} in grayscale`).setImage('attachment://grayscale.png');
            await i.editReply({ embeds: [embed], files: [new AttachmentBuilder(processed, { name: 'grayscale.png' })] });
        }
        catch {
            await i.editReply({ content: '❌ Failed.' });
        }
    }
    async executePrefix(m, _args) {
        const target = m.mentions.users.first() || m.author;
        try {
            const res = await fetch(target.displayAvatarURL({ extension: 'png', size: 512 }));
            const buf = Buffer.from(await res.arrayBuffer());
            const processed = await sharp(buf).grayscale().toBuffer();
            await m.reply({ files: [new AttachmentBuilder(processed, { name: 'grayscale.png' })] });
        }
        catch {
            await m.reply('❌ Failed.');
        }
    }
}
export default GrayscaleCommand;
