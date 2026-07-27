// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
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
    } as CommandOptions);
  }

  private async run(interaction: ChatInputCommandInteraction | null, message: Message | null): Promise<void> {
    const send = async (e: EmbedBuilder) => {
      if (interaction) await interaction.reply({ embeds: [e], flags: 64 });
      else await message!.reply({ embeds: [e] });
    };
    try {
      const db = await getMongoClient();
      const collections = ['ai_conversations', 'server_tags', 'user_notes', 'command_executions', 'premium_keys'];
      const fields: { name: string; value: string }[] = [];
      for (const col of collections) {
        try {
          const indexes = await db.collection(col).indexes();
          const names = indexes.map((i: any) => Object.keys(i.key).join('+') + (i.unique ? ' (unique)' : '')).join(', ');
          fields.push({ name: `📁 ${col}`, value: names || 'None', inline: false });
        } catch { fields.push({ name: `📁 ${col}`, value: 'Collection not found', inline: false }); }
      }
      const embed = new EmbedBuilder().setColor(COLORS.default).setTitle('🗂️ MongoDB Indexes').addFields(fields);
      await send(embed);
    } catch (err: any) {
      await send(new EmbedBuilder().setColor(COLORS.error).setTitle('❌ Error').setDescription(`\`\`\`${err.message}\`\`\``));
    }
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> { await this.run(interaction, null); }
  public async executePrefix(message: Message): Promise<void> { await this.run(null, message); }
}
export default MongoindexesCommand;
