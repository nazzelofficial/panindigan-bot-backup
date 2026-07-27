// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
export class MongoflushCommand extends BaseCommand {
    constructor() {
        super({
            name: 'mongoflush',
            description: 'Show dangerous warning for flushing a MongoDB collection',
            category: 'owner',
            premiumTier: 'free',
            cooldown: 0,
            guildOnly: false,
            ownerOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['mflush'],
            examples: ['p!mongoflush ai_conversations'],
        });
    }
    async run(interaction, message, collection) {
        const send = async (e) => {
            if (interaction)
                await interaction.reply({ embeds: [e], flags: 64 });
            else
                await message.reply({ embeds: [e] });
        };
        if (!collection)
            return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Provide a collection name.'));
        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('⚠️ DANGEROUS OPERATION')
            .setDescription(`You are about to **permanently delete ALL documents** in collection \`${collection}\`.\n\n**This action CANNOT be undone.**\n\nTo confirm, run:\n\`\`\`\nnpx ts-node -e "import('./src/database/mongodb/client.js').then(m => m.default().then(db => db.collection('${collection}').deleteMany({})))"\n\`\`\``);
        await send(embed);
    }
    async executeSlash(interaction) {
        await this.run(interaction, null, interaction.options.getString('collection', true));
    }
    async executePrefix(message, _args) {
        await this.run(null, message, args[0]);
    }
}
export default MongoflushCommand;
