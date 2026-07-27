// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
import { calculateLevelFromXP } from '../../handlers/LevelingHandler.js';
export class XpRemoveCommand extends BaseCommand {
    constructor() {
        super({
            name: 'xpremove',
            description: 'Remove XP from a user (Mod only)',
            category: 'leveling',
            premiumTier: 'bronze',
            cooldown: 5,
            ownerOnly: false,
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            userPermissions: [PermissionFlagsBits.ManageGuild],
            aliases: ['removexp'],
            examples: ['p!xpremove @user 200', '/xpremove @user 200'],
        });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption(o => o.setName('user').setDescription('Target user').setRequired(true))
            .addIntegerOption(o => o.setName('amount').setDescription('Amount of XP to remove').setRequired(true).setMinValue(1).setMaxValue(100000))
            .setDMPermission(false));
    }
    async removeXP(userId, guildId, amount) {
        const prisma = getPrismaClient();
        const existing = await prisma.leveling.findUnique({
            where: { userId_guildId: { userId, guildId } },
        });
        const currentXP = existing?.xp ?? 0;
        const newXP = Math.max(0, currentXP - amount);
        const newLevel = calculateLevelFromXP(newXP);
        await prisma.leveling.upsert({
            where: { userId_guildId: { userId, guildId } },
            create: { userId, guildId, xp: 0, level: 0 },
            update: { xp: newXP, level: newLevel },
        });
        return { removed: currentXP - newXP, newXP, newLevel };
    }
    async executeSlash(i) {
        const target = i.options.getUser('user', true);
        const amount = i.options.getInteger('amount', true);
        try {
            const { removed, newXP, newLevel } = await this.removeXP(target.id, i.guildId, amount);
            const embed = new EmbedBuilder()
                .setColor(COLORS.warning)
                .setTitle(`${EMOJIS.warning} XP Removed`)
                .setDescription(`Removed **${removed} XP** from **${target.username}**.\n` +
                `New total: **${newXP} XP** (Level **${newLevel}**)`)
                .setTimestamp();
            await i.reply({ embeds: [embed], ephemeral: true });
        }
        catch {
            await i.reply({ content: `${EMOJIS.error} Failed to remove XP.`, ephemeral: true });
        }
    }
    async executePrefix(m, _args) {
        const target = m.mentions.users.first();
        const amount = parseInt(args[1]);
        if (!target) {
            await m.reply(`${EMOJIS.error} Please mention a user. Usage: \`p!xpremove @user <amount>\``);
            return;
        }
        if (isNaN(amount) || amount < 1) {
            await m.reply(`${EMOJIS.error} Please provide a valid XP amount (1+).`);
            return;
        }
        if (!m.member?.permissions.has(PermissionFlagsBits.ManageGuild)) {
            await m.reply(`${EMOJIS.error} You need **Manage Server** permission.`);
            return;
        }
        try {
            const { removed, newXP, newLevel } = await this.removeXP(target.id, m.guildId, amount);
            const embed = new EmbedBuilder()
                .setColor(COLORS.warning)
                .setTitle(`${EMOJIS.warning} XP Removed`)
                .setDescription(`Removed **${removed} XP** from **${target.username}**.\n` +
                `New total: **${newXP} XP** (Level **${newLevel}**)`)
                .setTimestamp();
            await m.reply({ embeds: [embed] });
        }
        catch {
            await m.reply(`${EMOJIS.error} Failed to remove XP.`);
        }
    }
}
export default XpRemoveCommand;
