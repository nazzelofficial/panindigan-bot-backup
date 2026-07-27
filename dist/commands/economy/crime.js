// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class CrimeCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'crime',
            description: 'Commit a crime for potential rewards',
            category: 'economy',
            cooldown: 60,
            userPermissions: [],
            botPermissions: [],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['steal', 'heist'],
            examples: ['/crime', 'p!crime'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        if (!interaction.guildId)
            return;
        try {
            const prisma = getPrismaClient();
            const guild = await prisma.guild.upsert({
                where: { guildId: interaction.guildId },
                update: {},
                create: { guildId: interaction.guildId },
            });
            const crimes = [
                { name: 'Pickpocket', min: 50, max: 200, failChance: 0.3 },
                { name: 'Shoplift', min: 100, max: 400, failChance: 0.4 },
                { name: 'Car theft', min: 500, max: 1500, failChance: 0.5 },
                { name: 'Bank robbery', min: 1000, max: 5000, failChance: 0.6 },
            ];
            const crime = crimes[Math.floor(Math.random() * crimes.length)];
            const success = Math.random() > crime.failChance;
            if (success) {
                const reward = Math.floor(Math.random() * (crime.max - crime.min + 1)) + crime.min;
                await prisma.economy.upsert({
                    where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
                    update: { wallet: { increment: reward } },
                    create: { userId: interaction.user.id, guildId: interaction.guildId, wallet: reward, bank: 0 },
                });
                const embed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.economy} Crime Successful`)
                    .setColor(COLORS.success)
                    .addFields([
                    { name: 'Crime', value: crime.name, inline: true },
                    { name: 'Reward', value: `${reward} ${guild.currencySymbol || '💰'}`, inline: true },
                ])
                    .setTimestamp();
                await interaction.reply({ embeds: [embed] });
            }
            else {
                const fine = Math.floor(crime.min * 0.5);
                await prisma.economy.upsert({
                    where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
                    update: { wallet: { decrement: Math.min(fine, crime.min) } },
                    create: { userId: interaction.user.id, guildId: interaction.guildId, wallet: 0, bank: 0 },
                });
                const embed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.error} Crime Failed`)
                    .setColor(COLORS.error)
                    .addFields([
                    { name: 'Crime', value: crime.name, inline: true },
                    { name: 'Fine', value: `${Math.min(fine, crime.min)} ${guild.currencySymbol || '💰'}`, inline: true },
                ])
                    .setTimestamp();
                await interaction.reply({ embeds: [embed] });
            }
        }
        catch (error) {
            await interaction.reply({ content: '❌ Failed to commit crime.', ephemeral: true });
        }
    }
    async executePrefix(message) {
        if (!message.guildId)
            return;
        try {
            const prisma = getPrismaClient();
            const guild = await prisma.guild.upsert({
                where: { guildId: message.guildId },
                update: {},
                create: { guildId: message.guildId },
            });
            const crimes = [
                { name: 'Pickpocket', min: 50, max: 200, failChance: 0.3 },
                { name: 'Shoplift', min: 100, max: 400, failChance: 0.4 },
                { name: 'Car theft', min: 500, max: 1500, failChance: 0.5 },
                { name: 'Bank robbery', min: 1000, max: 5000, failChance: 0.6 },
            ];
            const crime = crimes[Math.floor(Math.random() * crimes.length)];
            const success = Math.random() > crime.failChance;
            if (success) {
                const reward = Math.floor(Math.random() * (crime.max - crime.min + 1)) + crime.min;
                await prisma.economy.upsert({
                    where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
                    update: { wallet: { increment: reward } },
                    create: { userId: message.author.id, guildId: message.guildId, wallet: reward, bank: 0 },
                });
                const embed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.economy} Crime Successful`)
                    .setColor(COLORS.success)
                    .addFields([
                    { name: 'Crime', value: crime.name, inline: true },
                    { name: 'Reward', value: `${reward} ${guild.currencySymbol || '💰'}`, inline: true },
                ])
                    .setTimestamp();
                await message.reply({ embeds: [embed] });
            }
            else {
                const fine = Math.floor(crime.min * 0.5);
                await prisma.economy.upsert({
                    where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
                    update: { wallet: { decrement: Math.min(fine, crime.min) } },
                    create: { userId: message.author.id, guildId: message.guildId, wallet: 0, bank: 0 },
                });
                const embed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.error} Crime Failed`)
                    .setColor(COLORS.error)
                    .addFields([
                    { name: 'Crime', value: crime.name, inline: true },
                    { name: 'Fine', value: `${Math.min(fine, crime.min)} ${guild.currencySymbol || '💰'}`, inline: true },
                ])
                    .setTimestamp();
                await message.reply({ embeds: [embed] });
            }
        }
        catch (error) {
            await message.reply('❌ Failed to commit crime.');
        }
    }
}
export default CrimeCommand;
