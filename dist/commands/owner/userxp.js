// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import getPrismaClient from '../../database/postgresql/client.js';
export class UserXpCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'userxp',
            description: 'Set XP for any user (Owner only)',
            category: 'owner',
            premiumTier: 'free',
            cooldown: 0,
            userPermissions: [],
            botPermissions: [],
            ownerOnly: true,
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['setxp'],
            examples: ['/userxp 123456789 5000', 'p!userxp 123456789 5000'],
        };
        super(options);
    }
    buildSlashCommand() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(o => o.setName('user_id').setDescription('User ID').setRequired(true))
            .addIntegerOption(o => o.setName('amount').setDescription('XP amount to set').setRequired(true));
    }
    async executeSlash(interaction) {
        const userId = interaction.options.getString('user_id', true);
        const amount = interaction.options.getInteger('amount', true);
        await interaction.deferReply({ ephemeral: true });
        try {
            const prisma = getPrismaClient();
            const updated = await prisma.userLevel.upsert({
                where: { userId },
                update: { xp: amount },
                create: { userId, xp: amount, level: 0 },
            });
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.leveling} XP Updated`)
                .setColor(COLORS.success)
                .addFields({ name: 'User ID', value: userId, inline: true }, { name: 'New XP', value: amount.toLocaleString(), inline: true }, { name: 'Level', value: String(updated.level ?? 0), inline: true })
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        }
        catch (error) {
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.error} Error`)
                .setColor(COLORS.error)
                .setDescription(`Failed to update XP: ${error?.message ?? 'Unknown error'}`)
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        }
    }
    async executePrefix(message, _args) {
        const [userId, amountStr] = _args;
        if (!userId || !amountStr) {
            await message.reply(`${EMOJIS.error} Usage: \`p!userxp <user_id> <amount>\``);
            return;
        }
        const amount = parseInt(amountStr, 10);
        if (isNaN(amount)) {
            await message.reply(`${EMOJIS.error} Amount must be a valid number.`);
            return;
        }
        try {
            const prisma = getPrismaClient();
            const updated = await prisma.userLevel.upsert({
                where: { userId },
                update: { xp: amount },
                create: { userId, xp: amount, level: 0 },
            });
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.leveling} XP Updated`)
                .setColor(COLORS.success)
                .addFields({ name: 'User ID', value: userId, inline: true }, { name: 'New XP', value: amount.toLocaleString(), inline: true }, { name: 'Level', value: String(updated.level ?? 0), inline: true })
                .setTimestamp();
            await message.reply({ embeds: [embed] });
        }
        catch (error) {
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.error} Error`)
                .setColor(COLORS.error)
                .setDescription(`Failed to update XP: ${error?.message ?? 'Unknown error'}`)
                .setTimestamp();
            await message.reply({ embeds: [embed] });
        }
    }
}
export default UserXpCommand;
