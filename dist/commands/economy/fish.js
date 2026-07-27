// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class FishCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'fish',
            description: 'Fish for resources',
            category: 'economy',
            cooldown: 30,
            userPermissions: [],
            botPermissions: [],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['catch', 'angle'],
            examples: ['/fish', 'p!fish'],
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
            const fish = [
                { name: '🐟 Common Fish', min: 1, max: 3, rarity: 0.6, value: 10 },
                { name: '🐠 Tropical Fish', min: 1, max: 2, rarity: 0.25, value: 25 },
                { name: '🐡 Pufferfish', min: 1, max: 1, rarity: 0.1, value: 50 },
                { name: '🦈 Shark', min: 1, max: 1, rarity: 0.04, value: 100 },
                { name: '🐋 Whale', min: 1, max: 1, rarity: 0.01, value: 500 },
            ];
            const caughtFish = [];
            for (const fishType of fish) {
                if (Math.random() < fishType.rarity) {
                    const amount = Math.floor(Math.random() * (fishType.max - fishType.min + 1)) + fishType.min;
                    caughtFish.push(`${fishType.name} x${amount} (${fishType.value * amount} ${guild.currencySymbol || '💰'})`);
                }
            }
            if (caughtFish.length === 0) {
                caughtFish.push('Nothing caught');
            }
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.economy} Fishing Results`)
                .setColor(COLORS.success)
                .addFields([
                { name: 'Caught', value: caughtFish.join(', '), inline: false },
            ])
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }
        catch (error) {
            await interaction.reply({ content: '❌ Failed to fish.', ephemeral: true });
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
            const fish = [
                { name: '🐟 Common Fish', min: 1, max: 3, rarity: 0.6, value: 10 },
                { name: '🐠 Tropical Fish', min: 1, max: 2, rarity: 0.25, value: 25 },
                { name: '🐡 Pufferfish', min: 1, max: 1, rarity: 0.1, value: 50 },
                { name: '🦈 Shark', min: 1, max: 1, rarity: 0.04, value: 100 },
                { name: '🐋 Whale', min: 1, max: 1, rarity: 0.01, value: 500 },
            ];
            const caughtFish = [];
            for (const fishType of fish) {
                if (Math.random() < fishType.rarity) {
                    const amount = Math.floor(Math.random() * (fishType.max - fishType.min + 1)) + fishType.min;
                    caughtFish.push(`${fishType.name} x${amount} (${fishType.value * amount} ${guild.currencySymbol || '💰'})`);
                }
            }
            if (caughtFish.length === 0) {
                caughtFish.push('Nothing caught');
            }
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.economy} Fishing Results`)
                .setColor(COLORS.success)
                .addFields([
                { name: 'Caught', value: caughtFish.join(', '), inline: false },
            ])
                .setTimestamp();
            await message.reply({ embeds: [embed] });
        }
        catch (error) {
            await message.reply('❌ Failed to fish.');
        }
    }
}
export default FishCommand;
