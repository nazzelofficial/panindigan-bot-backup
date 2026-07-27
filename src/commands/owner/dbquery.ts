// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder, codeBlock } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class DbQueryCommand extends BaseCommand {
  constructor() {
    super({ name: 'dbquery', description: 'Execute raw SQL query (Owner only)', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['sql', 'query', 'rawsql'], examples: ['p!dbquery SELECT COUNT(*) FROM "User"'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addStringOption(o => o.setName('query').setDescription('SQL query to execute').setRequired(true))) as SlashCommandBuilder;
  }

  private async runQuery(sql: string): Promise<{ result: string; success: boolean; timeTaken: number }> {
    const prisma = getPrismaClient();
    const start = Date.now();

    // Block destructive operations
    const dangerousKeywords = ['DROP TABLE', 'TRUNCATE', 'DELETE FROM', 'DROP DATABASE', 'DROP SCHEMA'];
    if (dangerousKeywords.some(k => sql.toUpperCase().includes(k))) {
      return { result: '⛔ Destructive SQL operations are not allowed via this command.', success: false, timeTaken: 0 };
    }

    try {
      const result = await prisma.$queryRawUnsafe(sql);
      const output = JSON.stringify(result, null, 2).slice(0, 1800);
      return { result: output, success: true, timeTaken: Date.now() - start };
    } catch (err: any) {
      return { result: err.message || String(err), success: false, timeTaken: Date.now() - start };
    }
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const query = i.options.getString('query', true);
    await i.deferReply({ ephemeral: true });
    const { result, success, timeTaken } = await this.runQuery(query);
    const embed = new EmbedBuilder()
      .setTitle(success ? '✅ Query Result' : '❌ Query Error')
      .setColor(success ? COLORS.success : COLORS.error)
      .addFields(
        { name: '📥 Query', value: codeBlock('sql', query.slice(0, 512)), inline: false },
        { name: '📤 Result', value: codeBlock('json', result.slice(0, 1000)), inline: false },
        { name: '⏱️ Time', value: `${timeTaken}ms`, inline: true },
      ).setTimestamp();
    await i.editReply({ embeds: [embed] });
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    const query = _args.join(' ');
    if (!query) { await m.reply('❌ Provide a SQL query.'); return; }
    const { result, success, timeTaken } = await this.runQuery(query);
    const embed = new EmbedBuilder()
      .setTitle(success ? '✅ Query Result' : '❌ Query Error')
      .setColor(success ? COLORS.success : COLORS.error)
      .addFields(
        { name: '📥 Query', value: codeBlock('sql', query.slice(0, 512)), inline: false },
        { name: '📤 Result', value: codeBlock('json', result.slice(0, 1000)), inline: false },
        { name: '⏱️ Time', value: `${timeTaken}ms`, inline: true },
      ).setTimestamp();
    await m.reply({ embeds: [embed] });
  }
}
export default DbQueryCommand;
