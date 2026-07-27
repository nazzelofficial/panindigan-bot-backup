// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class InventoryCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'inventory',
            description: 'View your inventory',
            category: 'economy',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['inv', 'items', 'bag'],
            examples: ['/inventory', 'p!inventory'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        if (!interaction.guildId)
            return;
        try {
            const prisma = getPrismaClient();
            const inventory = await prisma.inventory.findMany({
                where: { userId: interaction.user.id },
                include: { item: true },
            });
            if (inventory.length === 0) {
                await interaction.reply({ content: '❌ Your inventory is empty.', ephemeral: true });
                return;
            }
            const items = inventory.map((inv) => {
                const item = inv.item;
                return `${item?.name || 'Unknown'} x${inv.quantity}`;
            });
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.economy} ${interaction.user.tag}'s Inventory`)
                .setColor(COLORS.info)
                .setDescription(items.join('\n'))
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }
        catch (error) {
            await interaction.reply({ content: '❌ Failed to fetch inventory.', ephemeral: true });
        }
    }
    async executePrefix(message) {
        if (!message.guildId)
            return;
        try {
            const prisma = getPrismaClient();
            const inventory = await prisma.inventory.findMany({
                where: { userId: message.author.id },
                include: { item: true },
            });
            if (inventory.length === 0) {
                await message.reply('❌ Your inventory is empty.');
                return;
            }
            const items = inventory.map((inv) => {
                const item = inv.item;
                return `${item?.name || 'Unknown'} x${inv.quantity}`;
            });
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.economy} ${message.author.tag}'s Inventory`)
                .setColor(COLORS.info)
                .setDescription(items.join('\n'))
                .setTimestamp();
            await message.reply({ embeds: [embed] });
        }
        catch (error) {
            await message.reply('❌ Failed to fetch inventory.');
        }
    }
}
export default InventoryCommand;
