// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
export class PpCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'pp',
            description: 'Measure PP size',
            category: 'fun',
            premiumTier: 'free',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            ownerOnly: false,
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['ppsize', 'peepee'],
            examples: ['/pp', '/pp user:@someone', 'p!pp', 'p!pp @someone'],
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
    getPpEmbed(userId, displayName, avatarUrl) {
        const size = this.hashUserId(userId) % 30;
        const bar = '8' + '='.repeat(size) + 'D';
        let rating;
        if (size < 5)
            rating = 'Tiny 😂';
        else if (size < 10)
            rating = 'Small 😅';
        else if (size < 15)
            rating = 'Average 😐';
        else if (size < 20)
            rating = 'Big 😮';
        else if (size < 25)
            rating = 'Huge 🤩';
        else
            rating = 'LEGENDARY 👑';
        const embed = new EmbedBuilder()
            .setTitle(`📏 PP Meter`)
            .setDescription(`**${displayName}'s PP size:**\n\`\`\`${bar}\`\`\`\n**Size:** ${size} inches\n**Rating:** ${rating}`)
            .setColor(COLORS.default)
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
        const embed = this.getPpEmbed(target.id, displayName, avatarUrl);
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message, _args) {
        const mention = message.mentions.users.first();
        const target = mention ?? message.author;
        const member = message.guild?.members.cache.get(target.id);
        const displayName = member?.displayName ?? target.username;
        const avatarUrl = target.displayAvatarURL();
        const embed = this.getPpEmbed(target.id, displayName, avatarUrl);
        await message.reply({ embeds: [embed] });
    }
}
export default PpCommand;
