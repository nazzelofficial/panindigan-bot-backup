// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
export class GayrateCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'gayrate',
            description: 'Check someone\'s gay rate percentage',
            category: 'fun',
            premiumTier: 'free',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            ownerOnly: false,
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['gay', 'howgay'],
            examples: ['/gayrate', '/gayrate user:@someone', 'p!gayrate', 'p!gayrate @someone'],
        };
        super(options);
    }
    hashUserId(userId) {
        let hash = 0;
        for (let i = 0; i < userId.length; i++) {
            const char = userId.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash);
    }
    getRatingText(rate) {
        if (rate < 10)
            return 'Not gay at all 🚫';
        if (rate < 25)
            return 'Slightly gay 🏳️‍🌈';
        if (rate < 50)
            return 'Kinda gay 🌈';
        if (rate < 75)
            return 'Pretty gay 🌈✨';
        if (rate < 90)
            return 'Very gay 🏳️‍🌈💖';
        return 'Maximum gay! 🌈🏳️‍🌈✨💖';
    }
    buildEmbed(userId, displayName, avatarUrl) {
        const rate = this.hashUserId(userId) % 101;
        const bar = '█'.repeat(Math.floor(rate / 10)) + '░'.repeat(10 - Math.floor(rate / 10));
        const rating = this.getRatingText(rate);
        const embed = new EmbedBuilder()
            .setTitle('🏳️‍🌈 Gay Rate Meter')
            .setDescription(`**${displayName}** is **${rate}%** gay!\n\n\`[${bar}]\` ${rate}%\n\n**Rating:** ${rating}`)
            .setColor(0xff69b4)
            .setTimestamp();
        if (avatarUrl)
            embed.setThumbnail(avatarUrl);
        return embed;
    }
    async executeSlash(interaction) {
        const target = interaction.options.getUser('user') ?? interaction.user;
        const member = interaction.guild?.members.cache.get(target.id);
        const displayName = member?.displayName ?? target.username;
        const avatarUrl = target.displayAvatarURL();
        const embed = this.buildEmbed(target.id, displayName, avatarUrl);
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message, _args) {
        const target = message.mentions.users.first() ?? message.author;
        const member = message.guild?.members.cache.get(target.id);
        const displayName = member?.displayName ?? target.username;
        const avatarUrl = target.displayAvatarURL();
        const embed = this.buildEmbed(target.id, displayName, avatarUrl);
        await message.reply({ embeds: [embed] });
    }
}
export default GayrateCommand;
