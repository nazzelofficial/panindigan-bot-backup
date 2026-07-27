// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class RepsCommand extends BaseCommand {
    constructor() {
        super({
            name: 'reps',
            description: 'Tingnan ang reputation count ng user',
            category: 'social',
            premiumTier: 'silver',
            cooldown: 5,
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['reputation', 'rep'],
            examples: ['reps @User', 'reps'],
        });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption(o => o.setName('user').setDescription('Target user').setRequired(false))
            .setDMPermission(false));
    }
    async executeSlash(i) {
        await i.deferReply();
        try {
            const target = i.options.getUser('user') ?? i.user;
            const prisma = getPrismaClient();
            const userData = await prisma.user.findUnique({
                where: { discordId: target.id },
                select: { reputation: true },
            });
            const repCount = userData?.reputation ?? 0;
            const embed = new EmbedBuilder()
                .setColor(COLORS.PRIMARY)
                .setTitle('⭐ Reputation Count')
                .setDescription(`**${target.username}** ay may **${repCount}** reputation point${repCount !== 1 ? 's' : ''}!`)
                .setThumbnail(target.displayAvatarURL({ size: 128 }))
                .setFooter({ text: 'Panindigan Bot • Reputation System' })
                .setTimestamp();
            await i.editReply({ embeds: [embed] });
        }
        catch (error) {
            console.error('[RepsCommand] Error:', error);
            await i.editReply({ content: '❌ May error habang kinukuha ang reputation. Subukan ulit mamaya.' });
        }
    }
    async executePrefix(m, _args) {
        try {
            const target = m.mentions.users.first() ?? m.author;
            const prisma = getPrismaClient();
            const userData = await prisma.user.findUnique({
                where: { discordId: target.id },
                select: { reputation: true },
            });
            const repCount = userData?.reputation ?? 0;
            const embed = new EmbedBuilder()
                .setColor(COLORS.PRIMARY)
                .setTitle('⭐ Reputation Count')
                .setDescription(`**${target.username}** ay may **${repCount}** reputation point${repCount !== 1 ? 's' : ''}!`)
                .setThumbnail(target.displayAvatarURL({ size: 128 }))
                .setFooter({ text: 'Panindigan Bot • Reputation System' })
                .setTimestamp();
            await m.reply({ embeds: [embed] });
        }
        catch (error) {
            console.error('[RepsCommand] Error:', error);
            await m.reply('❌ May error habang kinukuha ang reputation. Subukan ulit mamaya.');
        }
    }
}
export default RepsCommand;
