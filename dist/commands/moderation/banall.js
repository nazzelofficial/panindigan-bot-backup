// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class BanAllCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'banall',
            description: 'Ban all users without a specific role',
            category: 'moderation',
            cooldown: 10,
            userPermissions: [PermissionFlagsBits.BanMembers],
            botPermissions: [PermissionFlagsBits.BanMembers],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['massban'],
            examples: ['/banall @role', 'p!banall @role'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const role = interaction.options.getRole('role');
        const reason = interaction.options.getString('reason') || 'Mass ban';
        if (!role) {
            await interaction.reply({ content: '❌ Please provide a role. Users WITH this role will NOT be banned.', ephemeral: true });
            return;
        }
        if (!interaction.guild)
            return;
        const membersToBan = interaction.guild.members.cache.filter(m => !m.user.bot && !m.roles.cache.has(role.id));
        if (membersToBan.size === 0) {
            await interaction.reply({ content: '❌ No members to ban.', ephemeral: true });
            return;
        }
        await interaction.deferReply();
        let banned = 0;
        let failed = 0;
        for (const member of membersToBan.values()) {
            try {
                await member.ban({ reason });
                banned++;
            }
            catch {
                failed++;
            }
        }
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.moderation} Mass Ban Complete`)
            .setColor(COLORS.error)
            .addFields([
            { name: 'Banned', value: banned.toString(), inline: true },
            { name: 'Failed', value: failed.toString(), inline: true },
            { name: 'Total', value: membersToBan.size.toString(), inline: true },
            { name: 'Moderator', value: interaction.user.tag, inline: false },
        ])
            .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
    }
    async executePrefix(message, _args) {
        const role = message.mentions.roles.first();
        const reason = _args.slice(1).join(' ') || 'Mass ban';
        if (!role) {
            await message.reply('❌ Please mention a role. Users WITH this role will NOT be banned.');
            return;
        }
        if (!message.guild)
            return;
        const membersToBan = message.guild.members.cache.filter(m => !m.user.bot && !m.roles.cache.has(role.id));
        if (membersToBan.size === 0) {
            await message.reply('❌ No members to ban.');
            return;
        }
        await message.reply('Starting mass ban...');
        let banned = 0;
        let failed = 0;
        for (const member of membersToBan.values()) {
            try {
                await member.ban({ reason });
                banned++;
            }
            catch {
                failed++;
            }
        }
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.moderation} Mass Ban Complete`)
            .setColor(COLORS.error)
            .addFields([
            { name: 'Banned', value: banned.toString(), inline: true },
            { name: 'Failed', value: failed.toString(), inline: true },
            { name: 'Total', value: membersToBan.size.toString(), inline: true },
            { name: 'Moderator', value: message.author.tag, inline: false },
        ])
            .setTimestamp();
        await message.channel.send({ embeds: [embed] });
    }
}
export default BanAllCommand;
