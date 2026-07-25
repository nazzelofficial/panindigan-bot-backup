import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';
import getMongoClient from '../../database/mongodb/client';

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
    } as CommandOptions);
  }

  private async run(interaction: ChatInputCommandInteraction | null, message: Message | null, collection: string, pipelineStr: string): Promise<void> {
    const send = async (e: EmbedBuilder) => {
      if (interaction) await interaction.reply({ embeds: [e], flags: 64 });
      else await message!.reply({ embeds: [e] });
    };
    if (!collection || !pipelineStr) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Usage: `mongoaggregate <collection> <pipeline_json>`'));
    let pipeline: any[];
    try { pipeline = JSON.parse(pipelineStr); } catch { return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Invalid JSON pipeline.')); }
    try {
      const db = await getMongoClient();
      const results = await db.collection(collection).aggregate(pipeline).limit(5).toArray();
      const embed = new EmbedBuilder().setColor(COLORS.default).setTitle(`📊 Aggregate: ${collection}`)
        .setDescription(`\`\`\`json\n${JSON.stringify(results, null, 2).slice(0, 1800)}\n\`\`\``);
      await send(embed);
    } catch (err: any) {
      await send(new EmbedBuilder().setColor(COLORS.error).setTitle('❌ Error').setDescription(`\`\`\`${err.message}\`\`\``));
    }
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await this.run(interaction, null, interaction.options.getString('collection', true), interaction.options.getString('pipeline', true));
  }
  public async executePrefix(message: Message, args: string[]): Promise<void> {
    await this.run(null, message, args[0], args.slice(1).join(' '));
  }
}
export default MongoaggregateCommand;
