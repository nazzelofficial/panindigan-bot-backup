// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder, AttachmentBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { ImageGenerator } from '../../structures/ImageGenerator.js';
export class WantedCommand extends BaseCommand {
    constructor() {
        super({ name: 'wanted', description: 'Generate a wanted poster for a user', category: 'image', premiumTier: 'free', cooldown: 8, guildOnly: false, slashCommand: true, prefixCommand: true, aliases: ['wantedposter', 'wanted-poster'], examples: ['/wanted @user', 'p!wanted @user'] });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder().setName(this.name).setDescription(this.description).addUserOption(o => o.setName('user').setDescription('Target user').setRequired(false)).setDMPermission(false));
    }
    async executeSlash(i) {
        const target = i.options.getUser('user') || i.user;
        await i.deferReply();
        try {
            const buf = await ImageGenerator.generateWantedPoster(target.displayName, target.displayAvatarURL({ extension: 'png', size: 256 }));
            const attachment = new AttachmentBuilder(buf, { name: 'wanted.png' });
            const embed = new EmbedBuilder().setColor(COLORS.warning).setDescription(`🤠 WANTED: **${target.username}**`).setImage('attachment://wanted.png');
            await i.editReply({ embeds: [embed], files: [attachment] });
        }
        catch {
            await i.editReply({ content: '❌ Failed to generate wanted poster.' });
        }
    }
    async executePrefix(m, _args) {
        const target = m.mentions.users.first() || m.author;
        try {
            const buf = await ImageGenerator.generateWantedPoster(target.displayName, target.displayAvatarURL({ extension: 'png', size: 256 }));
            await m.reply({ content: `🤠 WANTED: ${target.username}`, files: [new AttachmentBuilder(buf, { name: 'wanted.png' })] });
        }
        catch {
            await m.reply('❌ Failed.');
        }
    }
}
export default WantedCommand;
