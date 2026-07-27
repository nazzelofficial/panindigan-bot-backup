// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { connectMongoDB } from '../../database/mongodb/client.js';
export class MongoQueryCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'mongoquery',
            description: 'Run a MongoDB find query on a collection (limit 5)',
            category: 'owner',
            premiumTier: 'free',
            cooldown: 0,
            userPermissions: [],
            botPermissions: [],
            ownerOnly: true,
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['mongo-query', 'mdbquery'],
            examples: ['/mongoquery collection:{} ', 'p!mongoquery ai_conversations {}'],
        };
        super(options);
    }
    buildSlashCommand() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(opt => opt.setName('collection')
            .setDescription('Collection name')
            .setRequired(true))
            .addStringOption(opt => opt.setName('query')
            .setDescription('JSON query filter (e.g. {})')
            .setRequired(true));
    }
    async executeSlash(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const collection = interaction.options.getString('collection', true);
        const query = interaction.options.getString('query', true);
        const embed = await this.runQuery(collection, query);
        await interaction.editReply({ embeds: [embed] });
    }
    async executePrefix(message, _args) {
        if (args.length < 2) {
            await message.reply(`${EMOJIS.error} Usage: \`p!mongoquery <collection> <json_query>\``);
            return;
        }
        const collection = args[0];
        const query = _args.slice(1).join(' ');
        const loadingMsg = await message.reply(`${EMOJIS.loading} Running query...`);
        const embed = await this.runQuery(collection, query);
        await loadingMsg.edit({ content: '', embeds: [embed] });
    }
    async runQuery(collectionName, queryStr) {
        try {
            let filter;
            try {
                filter = JSON.parse(queryStr);
            }
            catch {
                return new EmbedBuilder()
                    .setTitle(`${EMOJIS.error} Invalid JSON`)
                    .setColor(COLORS.error)
                    .setDescription(`Could not parse query JSON:\n\`\`\`${queryStr}\`\`\``)
                    .setTimestamp();
            }
            const db = await connectMongoDB();
            const results = await db.collection(collectionName).find(filter).limit(5).toArray();
            if (results.length === 0) {
                return new EmbedBuilder()
                    .setTitle(`${EMOJIS.info} No Results`)
                    .setColor(COLORS.warning)
                    .setDescription(`No documents found in \`${collectionName}\` matching the query.`)
                    .setTimestamp();
            }
            const formatted = JSON.stringify(results, null, 2);
            const truncated = formatted.length > 3800 ? formatted.slice(0, 3800) + '\n...' : formatted;
            return new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} MongoDB Query Results`)
                .setColor(COLORS.default)
                .addFields({ name: '📁 Collection', value: `\`${collectionName}\``, inline: true }, { name: '📄 Results', value: `**${results.length}** document(s)`, inline: true }, { name: '🔍 Results', value: `\`\`\`json\n${truncated}\n\`\`\``, inline: false })
                .setFooter({ text: 'Limited to 5 documents' })
                .setTimestamp();
        }
        catch (error) {
            return new EmbedBuilder()
                .setTitle(`${EMOJIS.error} Query Failed`)
                .setColor(COLORS.error)
                .setDescription(`\`\`\`${error instanceof Error ? error.message : String(error)}\`\`\``)
                .setTimestamp();
        }
    }
}
export default MongoQueryCommand;
