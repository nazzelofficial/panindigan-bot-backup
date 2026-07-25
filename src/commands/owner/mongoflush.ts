import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';

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
    } as CommandOptions);
  }

  private async run(interaction: ChatInputCommandInteraction | null, message: Message | null, collection: string): Promise<void> {
    const send = async (e: EmbedBuilder) => {
      if (interaction) await interaction.reply({ embeds: [e], flags: 64 });
      else await message!.reply({ embeds: [e] });
    };
    if (!collection) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Provide a collection name.'));
    const embed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setTitle('⚠️ DANGEROUS OPERATION')
      .setDescription(`You are about to **permanently delete ALL documents** in collection \`${collection}\`.\n\n**This action CANNOT be undone.**\n\nTo confirm, run:\n\`\`\`\nnpx ts-node -e "require('./src/database/mongodb/client').default().then(db => db.collection('${collection}').deleteMany({}))"\n\`\`\``);
    await send(embed);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await this.run(interaction, null, interaction.options.getString('collection', true));
  }
  public async executePrefix(message: Message, args: string[]): Promise<void> {
    await this.run(null, message, args[0]);
  }
}
export default MongoflushCommand;
