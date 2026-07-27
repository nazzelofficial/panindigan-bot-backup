// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class SetXpCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'setxp',
            description: 'Set a user\'s XP amount',
            category: 'admin',
            cooldown: 3,
            userPermissions: [PermissionFlagsBits.Administrator],
            botPermissions: [PermissionFlagsBits.ManageGuild],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['setexperience', 'setxpamount'],
            examples: ['/setxp @user 1000', 'p!setxp @user 5000'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const user = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');
        if (!user) {
            await interaction.reply({ content: '❌ Please provide a user.', ephemeral: true });
            return;
        }
        if (amount === null || amount < 0) {
            await interaction.reply({ content: '❌ Please provide a valid XP amount (0 or greater).', ephemeral: true });
            return;
        }
        if (!interaction.guild)
            return;
        const prisma = getPrismaClient();
        await prisma.user.upsert({
            where: { userId_guildId: { userId: user.id, guildId: interaction.guild.id } },
            update: { xp: amount },
            create: { userId: user.id, guildId: interaction.guild.id, xp: amount },
        });
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.success} XP Set`)
            .setColor(COLORS.success)
            .addFields([
            { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
            { name: 'XP', value: amount.toString(), inline: true },
            { name: 'Updated by', value: interaction.user.tag, inline: true },
        ])
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message, _args) {
        const user = message.mentions.users.first();
        const amount = parseInt(args[1]);
        if (!user) {
            await message.reply('❌ Please mention a user.');
            return;
        }
        if (isNaN(amount) || amount < 0) {
            await message.reply('❌ Please provide a valid XP amount (0 or greater).');
            return;
        }
        if (!message.guild)
            return;
        const prisma = getPrismaClient();
        await prisma.user.upsert({
            where: { userId_guildId: { userId: user.id, guildId: message.guild.id } },
            update: { xp: amount },
            create: { userId: user.id, guildId: message.guild.id, xp: amount },
        });
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.success} XP Set`)
            .setColor(COLORS.success)
            .addFields([
            { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
            { name: 'XP', value: amount.toString(), inline: true },
            { name: 'Updated by', value: message.author.tag, inline: true },
        ])
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default SetXpCommand;
