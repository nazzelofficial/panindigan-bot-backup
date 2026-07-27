// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class DuckCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'duck',
            description: 'Get a random duck image',
            category: 'fun',
            premiumTier: 'bronze',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            ownerOnly: false,
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['quack', 'duckpic'],
            examples: ['/duck', 'p!duck'],
        };
        super(options);
    }
    async fetchDuckImage() {
        try {
            const response = await fetch('https://random-d.uk/api/v2/random');
            if (!response.ok)
                return null;
            const data = await response.json();
            return data.url ?? null;
        }
        catch {
            return null;
        }
    }
    async executeSlash(interaction) {
        await interaction.deferReply();
        const imageUrl = await this.fetchDuckImage();
        if (!imageUrl) {
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.error} Fetch Failed`)
                .setDescription('Could not fetch a duck image right now. Please try again later!')
                .setColor(COLORS.error);
            await interaction.editReply({ embeds: [embed] });
            return;
        }
        const embed = new EmbedBuilder()
            .setTitle('🦆 Random Duck')
            .setColor(0xf5d800)
            .setImage(imageUrl)
            .setFooter({ text: 'Powered by random-d.uk • Quack! 🦆' })
            .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
    }
    async executePrefix(message) {
        const imageUrl = await this.fetchDuckImage();
        if (!imageUrl) {
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.error} Fetch Failed`)
                .setDescription('Could not fetch a duck image right now. Please try again later!')
                .setColor(COLORS.error);
            await message.reply({ embeds: [embed] });
            return;
        }
        const embed = new EmbedBuilder()
            .setTitle('🦆 Random Duck')
            .setColor(0xf5d800)
            .setImage(imageUrl)
            .setFooter({ text: 'Powered by random-d.uk • Quack! 🦆' })
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default DuckCommand;
