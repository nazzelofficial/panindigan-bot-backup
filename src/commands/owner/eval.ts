import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder, codeBlock } from 'discord.js';
import { COLORS } from '../../utils/Constants';
import { inspect } from 'util';

export class EvalCommand extends BaseCommand {
  constructor() {
    super({ name: 'eval', description: 'Execute arbitrary JavaScript code (Owner only)', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['ev', 'evaluate'], examples: ['p!eval client.users.cache.size'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addStringOption(o => o.setName('code').setDescription('Code to evaluate').setRequired(true))
      .addBooleanOption(o => o.setName('async').setDescription('Wrap in async function').setRequired(false))
      .addBooleanOption(o => o.setName('silent').setDescription('Silent mode (no output)').setRequired(false))) as SlashCommandBuilder;
  }

  private async runEval(code: string, context: any, isAsync: boolean): Promise<{ output: string; success: boolean; timeTaken: number }> {
    const { client, message, interaction } = context;
    const start = Date.now();
    let output: string;
    let success = true;

    const toEval = isAsync ? `(async () => { ${code} })()` : code;

    try {
      // eslint-disable-next-line no-eval
      let result = eval(toEval);
      if (result instanceof Promise) result = await result;
      if (typeof result !== 'string') result = inspect(result, { depth: 2 });
      output = result as string;
    } catch (err: any) {
      output = err?.toString() || 'Unknown error';
      success = false;
    }

    return { output: output.slice(0, 1900), success, timeTaken: Date.now() - start };
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const code = i.options.getString('code', true);
    const isAsync = i.options.getBoolean('async') ?? false;
    const silent = i.options.getBoolean('silent') ?? false;
    await i.deferReply({ ephemeral: true });

    const { output, success, timeTaken } = await this.runEval(code, { client: i.client, interaction: i }, isAsync);

    if (silent) { await i.editReply({ content: success ? '✅ Executed.' : '❌ Error occurred.' }); return; }

    const embed = new EmbedBuilder()
      .setTitle(success ? '✅ Eval Result' : '❌ Eval Error')
      .setColor(success ? COLORS.success : COLORS.error)
      .addFields(
        { name: '📥 Input', value: codeBlock('js', code.slice(0, 512)), inline: false },
        { name: '📤 Output', value: codeBlock('js', output.slice(0, 900)), inline: false },
        { name: '⏱️ Time', value: `${timeTaken}ms`, inline: true },
      ).setTimestamp();
    await i.editReply({ embeds: [embed] });
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    const code = args.join(' ');
    if (!code) { await m.reply('❌ Provide code to evaluate.'); return; }
    const isAsync = code.includes('await');
    const { output, success, timeTaken } = await this.runEval(code, { client: m.client, message: m }, isAsync);
    const embed = new EmbedBuilder()
      .setTitle(success ? '✅ Eval Result' : '❌ Eval Error')
      .setColor(success ? COLORS.success : COLORS.error)
      .addFields(
        { name: '📥 Input', value: codeBlock('js', code.slice(0, 512)), inline: false },
        { name: '📤 Output', value: codeBlock('js', output.slice(0, 900)), inline: false },
        { name: '⏱️ Time', value: `${timeTaken}ms`, inline: true },
      ).setTimestamp();
    await m.reply({ embeds: [embed] });
  }
}
export default EvalCommand;
