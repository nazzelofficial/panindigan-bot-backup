// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class LevelresetCommand extends BaseCommand {
    constructor() {
        super({
            name: 'levelreset',
            description: 'Reset XP for a user or the entire server',
            category: 'leveling',
            premiumTier: 'diamond',
            cooldown: 10,
            userPermissions: [PermissionFlagsBits.Administrator],
            botPermissions: [],
            ownerOnly: false,
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['resetlevel', 'resetxp'],
            examples: ['/levelreset all', '/levelreset @user', 'p!levelreset all', 'p!levelreset @user'],
        });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(o => o.setName('target').setDescription('Type "all" to reset everyone, or mention a user').setRequired(false))
            .addUserOption(o => o.setName('user').setDescription('Specific user to reset XP for').setRequired(false))
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
            .setDMPermission(false));
    }
    async executeSlash(interaction) {
        const targetStr = interaction.options.getString('target');
        const user = interaction.options.getUser('user');
        if (targetStr?.toLowerCase() === 'all') {
            // Confirmation for mass reset
            const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('confirm_reset_all').setLabel('Confirm Reset All').setStyle(ButtonStyle.Danger), new ButtonBuilder().setCustomId('cancel_reset_all').setLabel('Cancel').setStyle(ButtonStyle.Secondary));
            const confirmEmbed = new EmbedBuilder()
                .setTitle(`${EMOJIS.warning} Confirm Mass XP Reset`)
                .setColor(COLORS.error)
                .setDescription('⚠️ This will **permanently delete** all XP and leveling data for **every member** in this server.\n\nThis action **cannot be undone!**')
                .setTimestamp();
            await interaction.reply({ embeds: [confirmEmbed], components: [row] });
            const reply = await interaction.fetchReply();
            const collector = reply.createMessageComponentCollector({ time: 30000, max: 1 });
            collector.on('collect', async (btn) => {
                if (btn.user.id !== interaction.user.id) {
                    await btn.reply({ content: 'Only the command invoker can confirm.', ephemeral: true });
                    return;
                }
                if (btn.customId === 'confirm_reset_all') {
                    await btn.deferUpdate();
                    try {
                        const prisma = getPrismaClient();
                        const result = await prisma.leveling.deleteMany({ where: { guildId: interaction.guildId } });
                        const doneEmbed = new EmbedBuilder()
                            .setTitle(`${EMOJIS.success} XP Reset Complete`)
                            .setColor(COLORS.success)
                            .setDescription(`Successfully reset XP for **${result.count}** member${result.count !== 1 ? 's' : ''} in this server.`)
                            .setTimestamp();
                        await interaction.editReply({ embeds: [doneEmbed], components: [] });
                    }
                    catch {
                        await interaction.editReply({ content: `${EMOJIS.error} Failed to reset XP data.`, components: [] });
                    }
                }
                else {
                    await btn.deferUpdate();
                    const cancelEmbed = new EmbedBuilder().setTitle('Cancelled').setColor(COLORS.default).setDescription('Mass XP reset was cancelled.');
                    await interaction.editReply({ embeds: [cancelEmbed], components: [] });
                }
            });
            collector.on('end', (collected) => {
                if (collected.size === 0) {
                    interaction.editReply({ content: 'Confirmation timed out. No changes made.', components: [] }).catch(() => { });
                }
            });
        }
        else if (user) {
            await interaction.deferReply();
            try {
                const prisma = getPrismaClient();
                await prisma.leveling.upsert({
                    where: { userId_guildId: { userId: user.id, guildId: interaction.guildId } },
                    update: { xp: 0, level: 0, totalXp: 0 },
                    create: { userId: user.id, guildId: interaction.guildId, xp: 0, level: 0, totalXp: 0 },
                });
                const embed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.success} XP Reset`)
                    .setColor(COLORS.success)
                    .setDescription(`Successfully reset XP for **${user.username}**.`)
                    .setThumbnail(user.displayAvatarURL())
                    .setTimestamp();
                await interaction.editReply({ embeds: [embed] });
            }
            catch {
                await interaction.editReply({ content: `${EMOJIS.error} Failed to reset user XP.` });
            }
        }
        else {
            await interaction.reply({ content: `${EMOJIS.error} Please specify \`all\` or a user to reset.`, ephemeral: true });
        }
    }
    async executePrefix(message, _args) {
        const target = args[0];
        const mentionedUser = message.mentions.users.first();
        if (target?.toLowerCase() === 'all') {
            const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('confirm_reset_all_pfx').setLabel('Confirm Reset All').setStyle(ButtonStyle.Danger), new ButtonBuilder().setCustomId('cancel_reset_all_pfx').setLabel('Cancel').setStyle(ButtonStyle.Secondary));
            const confirmEmbed = new EmbedBuilder()
                .setTitle(`${EMOJIS.warning} Confirm Mass XP Reset`)
                .setColor(COLORS.error)
                .setDescription('⚠️ This will **permanently delete** all XP and leveling data for **every member** in this server.\n\nThis action **cannot be undone!**')
                .setTimestamp();
            const reply = await message.reply({ embeds: [confirmEmbed], components: [row] });
            const collector = reply.createMessageComponentCollector({ time: 30000, max: 1 });
            collector.on('collect', async (btn) => {
                if (btn.user.id !== message.author.id) {
                    await btn.reply({ content: 'Only the command invoker can confirm.', ephemeral: true });
                    return;
                }
                if (btn.customId === 'confirm_reset_all_pfx') {
                    await btn.deferUpdate();
                    try {
                        const prisma = getPrismaClient();
                        const result = await prisma.leveling.deleteMany({ where: { guildId: message.guildId } });
                        const doneEmbed = new EmbedBuilder()
                            .setTitle(`${EMOJIS.success} XP Reset Complete`)
                            .setColor(COLORS.success)
                            .setDescription(`Successfully reset XP for **${result.count}** member${result.count !== 1 ? 's' : ''}.`)
                            .setTimestamp();
                        await reply.edit({ embeds: [doneEmbed], components: [] });
                    }
                    catch {
                        await reply.edit({ content: `${EMOJIS.error} Failed to reset XP data.`, components: [] });
                    }
                }
                else {
                    await btn.deferUpdate();
                    await reply.edit({ content: 'Cancelled.', embeds: [], components: [] });
                }
            });
        }
        else if (mentionedUser) {
            try {
                const prisma = getPrismaClient();
                await prisma.leveling.upsert({
                    where: { userId_guildId: { userId: mentionedUser.id, guildId: message.guildId } },
                    update: { xp: 0, level: 0, totalXp: 0 },
                    create: { userId: mentionedUser.id, guildId: message.guildId, xp: 0, level: 0, totalXp: 0 },
                });
                const embed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.success} XP Reset`)
                    .setColor(COLORS.success)
                    .setDescription(`Successfully reset XP for **${mentionedUser.username}**.`)
                    .setThumbnail(mentionedUser.displayAvatarURL())
                    .setTimestamp();
                await message.reply({ embeds: [embed] });
            }
            catch {
                await message.reply(`${EMOJIS.error} Failed to reset user XP.`);
            }
        }
        else {
            await message.reply(`${EMOJIS.error} Usage: \`p!levelreset all\` or \`p!levelreset @user\``);
        }
    }
}
export default LevelresetCommand;
