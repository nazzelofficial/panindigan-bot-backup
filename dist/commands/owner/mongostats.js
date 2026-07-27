// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { connectMongoDB } from '../../database/mongodb/client.js';
export class MongostatsCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'mongostats',
            description: 'Show MongoDB database statistics',
            category: 'owner',
            premiumTier: 'free',
            cooldown: 0,
            userPermissions: [],
            botPermissions: [],
            ownerOnly: true,
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['mongo-stats', 'mdbstats'],
            examples: ['/mongostats', 'p!mongostats'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const embed = await this.getStats();
        await interaction.editReply({ embeds: [embed] });
    }
    async executePrefix(message, _args) {
        const loadingMsg = await message.reply(`${EMOJIS.loading} Fetching MongoDB stats...`);
        const embed = await this.getStats();
        await loadingMsg.edit({ content: '', embeds: [embed] });
    }
    async getStats() {
        try {
            const db = await connectMongoDB();
            const collections = await db.listCollections().toArray();
            const counts = [];
            for (const col of collections) {
                const count = await db.collection(col.name).countDocuments();
                counts.push({ name: col.name, count });
            }
            counts.sort((a, b) => b.count - a.count);
            const totalDocs = counts.reduce((sum, c) => sum + c.count, 0);
            const listText = counts
                .map((c, i) => `\`${(i + 1).toString().padStart(2, '0')}.\` **${c.name}** — ${c.count.toLocaleString()} docs`)
                .join('\n') || 'No collections found.';
            return new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} MongoDB Statistics`)
                .setColor(COLORS.default)
                .setDescription(listText.length > 4000 ? listText.slice(0, 4000) : listText)
                .addFields({
                name: '📁 Total Collections',
                value: `**${collections.length}**`,
                inline: true,
            }, {
                name: '📄 Total Documents',
                value: `**${totalDocs.toLocaleString()}**`,
                inline: true,
            })
                .setFooter({ text: `Database: ${db.databaseName}` })
                .setTimestamp();
        }
        catch (error) {
            return new EmbedBuilder()
                .setTitle(`${EMOJIS.error} MongoDB Stats Failed`)
                .setColor(COLORS.error)
                .setDescription(`\`\`\`${error instanceof Error ? error.message : String(error)}\`\`\``)
                .setTimestamp();
        }
    }
}
export default MongostatsCommand;
