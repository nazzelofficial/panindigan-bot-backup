// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { connectMongoDB } from '../../database/mongodb/client.js';
export class MongoCountCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'mongocount',
            description: 'Count documents in a MongoDB collection',
            category: 'owner',
            premiumTier: 'free',
            cooldown: 0,
            userPermissions: [],
            botPermissions: [],
            ownerOnly: true,
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['mongo-count', 'mdbcount'],
            examples: ['/mongocount collection:ai_conversations', 'p!mongocount ai_conversations'],
        };
        super(options);
    }
    buildSlashCommand() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(opt => opt.setName('collection_name')
            .setDescription('Name of the MongoDB collection')
            .setRequired(true));
    }
    async executeSlash(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const collectionName = interaction.options.getString('collection_name', true);
        const embed = await this.countDocs(collectionName);
        await interaction.editReply({ embeds: [embed] });
    }
    async executePrefix(message, _args) {
        if (!args[0]) {
            await message.reply(`${EMOJIS.error} Usage: \`p!mongocount <collection_name>\``);
            return;
        }
        const loadingMsg = await message.reply(`${EMOJIS.loading} Counting documents...`);
        const embed = await this.countDocs(args[0]);
        await loadingMsg.edit({ content: '', embeds: [embed] });
    }
    async countDocs(collectionName) {
        try {
            const db = await connectMongoDB();
            const count = await db.collection(collectionName).countDocuments();
            return new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} MongoDB Document Count`)
                .setColor(COLORS.default)
                .addFields({
                name: '📁 Collection',
                value: `\`${collectionName}\``,
                inline: true,
            }, {
                name: '📄 Document Count',
                value: `**${count.toLocaleString()}**`,
                inline: true,
            })
                .setFooter({ text: `Database: ${db.databaseName}` })
                .setTimestamp();
        }
        catch (error) {
            return new EmbedBuilder()
                .setTitle(`${EMOJIS.error} Count Failed`)
                .setColor(COLORS.error)
                .setDescription(`\`\`\`${error instanceof Error ? error.message : String(error)}\`\`\``)
                .setTimestamp();
        }
    }
}
export default MongoCountCommand;
