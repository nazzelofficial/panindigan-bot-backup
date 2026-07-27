// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import getMongoClient from '../../database/mongodb/client.js';
export class MongoindexesCommand extends BaseCommand {
    constructor() {
        super({
            name: 'mongoindexes',
            description: 'List MongoDB indexes for key collections',
            category: 'owner',
            premiumTier: 'free',
            cooldown: 0,
            guildOnly: false,
            ownerOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['mindexes'],
            examples: ['p!mongoindexes'],
        });
    }
    async run(interaction, message) {
        const send = async (e) => {
            if (interaction)
                await interaction.reply({ embeds: [e], flags: 64 });
            else
                await message.reply({ embeds: [e] });
        };
        try {
            const db = await getMongoClient();
            const collections = ['ai_conversations', 'server_tags', 'user_notes', 'command_executions', 'premium_keys'];
            const fields = [];
            for (const col of collections) {
                try {
                    const indexes = await db.collection(col).indexes();
                    const names = indexes.map((i) => Object.keys(i.key).join('+') + (i.unique ? ' (unique)' : '')).join(', ');
                    fields.push({ name: `📁 ${col}`, value: names || 'None', inline: false });
                }
                catch {
                    fields.push({ name: `📁 ${col}`, value: 'Collection not found', inline: false });
                }
            }
            const embed = new EmbedBuilder().setColor(COLORS.default).setTitle('🗂️ MongoDB Indexes').addFields(fields);
            await send(embed);
        }
        catch (err) {
            await send(new EmbedBuilder().setColor(COLORS.error).setTitle('❌ Error').setDescription(`\`\`\`${err.message}\`\`\``));
        }
    }
    async executeSlash(interaction) { await this.run(interaction, null); }
    async executePrefix(message) { await this.run(null, message); }
}
export default MongoindexesCommand;
