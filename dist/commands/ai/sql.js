// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class SqlCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'sql',
            description: 'Generate or optimize SQL queries using AI',
            category: 'ai',
            cooldown: 8,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['query', 'sqlgen'],
            examples: ['/sql Get all users who signed up in the last 30 days', 'p!sql Find duplicate emails in users table'],
        };
        super(options);
    }
    buildSlashCommand() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(o => o.setName('request').setDescription('What SQL query you need').setRequired(true))
            .addStringOption(o => o.setName('dialect').setDescription('SQL dialect').setRequired(false)
            .addChoices({ name: 'PostgreSQL', value: 'PostgreSQL' }, { name: 'MySQL', value: 'MySQL' }, { name: 'SQLite', value: 'SQLite' }, { name: 'SQL Server', value: 'SQL Server' }));
    }
    async executeSlash(interaction) {
        const request = interaction.options.getString('request', true);
        const dialect = interaction.options.getString('dialect') || 'PostgreSQL';
        await interaction.deferReply();
        try {
            const client = interaction.client;
            const response = await client.aiHandler.generateTaskResponse(request, `You are a SQL expert. Write a ${dialect} query for the request. Include: 1) The SQL query (in a code block). 2) Explanation of how it works. 3) Any indexes that would help performance. 4) Alternative approaches if relevant. Follow ${dialect} best practices.`);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} 🗄️ SQL Query`)
                .setColor(COLORS.info)
                .addFields({ name: '📋 Request', value: request.slice(0, 512), inline: false }, { name: `💾 ${dialect} Query`, value: response.content.slice(0, 3500), inline: false })
                .setFooter({ text: `Dialect: ${dialect} | Provider: ${response.provider}` })
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        }
        catch (err) {
            await interaction.editReply({ content: `${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}` });
        }
    }
    async executePrefix(message, _args) {
        const request = _args.join(' ');
        if (!request)
            return void message.reply(`${EMOJIS.error} Please describe the SQL query you need.`);
        const thinking = await message.reply(`${EMOJIS.ai} Generating SQL...`);
        try {
            const client = message.client;
            const response = await client.aiHandler.generateTaskResponse(request, 'Write a SQL query for this request. Include the query in a code block and explanation of how it works.');
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} 🗄️ SQL Query`)
                .setColor(COLORS.info)
                .addFields({ name: '💾 Query', value: response.content.slice(0, 3800), inline: false })
                .setFooter({ text: `Provider: ${response.provider}` })
                .setTimestamp();
            await thinking.edit({ content: null, embeds: [embed] });
        }
        catch (err) {
            await thinking.edit(`${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}`);
        }
    }
}
export default SqlCommand;
