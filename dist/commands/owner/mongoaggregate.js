// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getMongoDb as getMongoClient } from '../../database/mongodb/client.js';
export class MongoaggregateCommand extends BaseCommand {
    constructor() {
        super({
            name: 'mongoaggregate',
            description: 'Run a MongoDB aggregation pipeline on a collection',
            category: 'owner',
            premiumTier: 'free',
            cooldown: 0,
            guildOnly: false,
            ownerOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['magg'],
            examples: ['p!mongoaggregate command_executions [{"$group":{"_id":"$command","count":{"$sum":1}}}]'],
        });
    }
    async run(interaction, message, collection, pipelineStr) {
        const send = async (e) => {
            if (interaction)
                await interaction.reply({ embeds: [e], flags: 64 });
            else
                await message.reply({ embeds: [e] });
        };
        if (!collection || !pipelineStr)
            return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Usage: `mongoaggregate <collection> <pipeline_json>`'));
        let pipeline;
        try {
            pipeline = JSON.parse(pipelineStr);
        }
        catch {
            return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Invalid JSON pipeline.'));
        }
        try {
            const db = await getMongoClient();
            const results = await db.collection(collection).aggregate(pipeline).limit(5).toArray();
            const embed = new EmbedBuilder().setColor(COLORS.default).setTitle(`📊 Aggregate: ${collection}`)
                .setDescription(`\`\`\`json\n${JSON.stringify(results, null, 2).slice(0, 1800)}\n\`\`\``);
            await send(embed);
        }
        catch (err) {
            await send(new EmbedBuilder().setColor(COLORS.error).setTitle('❌ Error').setDescription(`\`\`\`${err.message}\`\`\``));
        }
    }
    async executeSlash(interaction) {
        await this.run(interaction, null, interaction.options.getString('collection', true), interaction.options.getString('pipeline', true));
    }
    async executePrefix(message, _args) {
        await this.run(null, message, args[0], _args.slice(1).join(' '));
    }
}
export default MongoaggregateCommand;
