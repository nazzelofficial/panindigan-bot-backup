// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class DbstatsCommand extends BaseCommand {
  constructor() {
    super({
      name: 'dbstats',
      description: 'Show PostgreSQL database statistics',
      category: 'owner',
      premiumTier: 'free',
      cooldown: 0,
      guildOnly: false,
      ownerOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['dbs'],
      examples: ['p!dbstats'],
    } as CommandOptions);
  }

  private async run(interaction: ChatInputCommandInteraction | null, message: Message | null): Promise<void> {
    const send = async (e: EmbedBuilder) => {
      if (interaction) await interaction.reply({ embeds: [e], flags: 64 });
      else await message!.reply({ embeds: [e] });
    };
    try {
      const prisma = getPrismaClient();
      const start = Date.now();
      const tables = await prisma.$queryRaw<{ tablename: string; size: string }[]>`
        SELECT tablename, pg_size_pretty(pg_total_relation_size(tablename::regclass)) as size
        FROM pg_tables WHERE schemaname = 'public' ORDER BY pg_total_relation_size(tablename::regclass) DESC LIMIT 10`;
      const latency = Date.now() - start;
      const [{ count }] = await prisma.$queryRaw<{ count: bigint }[]>`SELECT COUNT(*) as count FROM pg_tables WHERE schemaname = 'public'`;
      const embed = new EmbedBuilder()
        .setColor(COLORS.default)
        .setTitle('🗄️ PostgreSQL Statistics')
        .setDescription(`Latency: \`${latency}ms\` | Tables: \`${count}\``)
        .addFields(
          { name: '📊 Largest Tables', value: tables.map(t => `\`${t.tablename}\`: ${t.size}`).join('\n') || 'None' }
        );
      await send(embed);
    } catch (err: any) {
      await send(new EmbedBuilder().setColor(COLORS.error).setTitle('❌ DB Error').setDescription(`\`\`\`${err.message}\`\`\``));
    }
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> { await this.run(interaction, null); }
  public async executePrefix(message: Message): Promise<void> { await this.run(null, message); }
}
export default DbstatsCommand;
