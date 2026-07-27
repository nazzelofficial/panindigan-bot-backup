// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class FoxCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'fox',
            description: 'Get a random fox image',
            category: 'fun',
            premiumTier: 'bronze',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            ownerOnly: false,
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['foxpic', 'randomfox'],
            examples: ['/fox', 'p!fox'],
        };
        super(options);
    }
    async fetchFoxImage() {
        try {
            const response = await fetch('https://randomfox.ca/floof/');
            if (!response.ok)
                return null;
            const data = await response.json();
            return data.image ?? null;
        }
        catch {
            return null;
        }
    }
    async executeSlash(interaction) {
        await interaction.deferReply();
        const imageUrl = await this.fetchFoxImage();
        if (!imageUrl) {
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.error} Fetch Failed`)
                .setDescription('Could not fetch a fox image right now. Please try again later!')
                .setColor(COLORS.error);
            await interaction.editReply({ embeds: [embed] });
            return;
        }
        const embed = new EmbedBuilder()
            .setTitle('🦊 Random Fox')
            .setColor(0xff8c00)
            .setImage(imageUrl)
            .setFooter({ text: 'Powered by randomfox.ca' })
            .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
    }
    async executePrefix(message) {
        const imageUrl = await this.fetchFoxImage();
        if (!imageUrl) {
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.error} Fetch Failed`)
                .setDescription('Could not fetch a fox image right now. Please try again later!')
                .setColor(COLORS.error);
            await message.reply({ embeds: [embed] });
            return;
        }
        const embed = new EmbedBuilder()
            .setTitle('🦊 Random Fox')
            .setColor(0xff8c00)
            .setImage(imageUrl)
            .setFooter({ text: 'Powered by randomfox.ca' })
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default FoxCommand;
