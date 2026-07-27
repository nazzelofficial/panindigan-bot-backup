// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder, codeBlock } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { inspect } from 'util';

export class ShardEvalCommand extends BaseCommand {
  constructor() {
    super({
      name: 'shardeval',
      description: 'Run eval on a specific shard',
      category: 'owner',
      premiumTier: 'free',
      cooldown: 0,
      ownerOnly: true,
      guildOnly: false,
      slashCommand: false,
      prefixCommand: true,
      aliases: ['seval'],
      examples: ['p!shardeval 0 client.guilds.cache.size'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder().setName(this.name).setDescription(this.description).setDMPermission(false) as SlashCommandBuilder;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    await i.reply({ content: 'Use prefix command `p!shardeval <shardId> <code>` for this.', ephemeral: true });
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    try {
      const client = m.client as any;

      if (args.length < 2) {
        await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Usage: `p!shardeval <shardId> <code>`')] });
        return;
      }

      const shardId = parseInt(args[0]);
      if (isNaN(shardId)) {
        await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Invalid shard ID.')] });
        return;
      }

      const code = _args.slice(1).join(' ');

      if (!client.shard) {
        // No shard manager — just eval locally
        let result: any;
        let success = true;
        try {
          // eslint-disable-next-line no-eval
          result = eval(code);
          if (result instanceof Promise) result = await result;
          if (typeof result !== 'string') result = inspect(result, { depth: 2 });
        } catch (e: any) {
          result = e?.toString();
          success = false;
        }
        const embed = new EmbedBuilder()
          .setTitle(success ? '✅ ShardEval Result (local)' : '❌ ShardEval Error')
          .setColor(success ? COLORS.success : COLORS.error)
          .addFields(
            { name: 'Code', value: codeBlock('js', code.slice(0, 512)), inline: false },
            { name: 'Output', value: codeBlock('js', String(result).slice(0, 900)), inline: false },
          )
          .setTimestamp();
        await m.reply({ embeds: [embed] });
        return;
      }

      const results: any[] = await client.shard.broadcastEval(
        async (c: any, { evalCode }: { evalCode: string }) => {
          if (!c.shard?.ids.includes(0)) return null;
          try {
            // eslint-disable-next-line no-eval
            let r = eval(evalCode);
            if (r instanceof Promise) r = await r;
            return { success: true, output: String(r).slice(0, 900) };
          } catch (e: any) {
            return { success: false, output: e?.toString() };
          }
        },
        { context: { evalCode: code } }
      );

      const shardResult = results[shardId];
      if (!shardResult) {
        await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ Shard ${shardId} not found or returned null.`)] });
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle(shardResult.success ? `✅ ShardEval Result (Shard ${shardId})` : `❌ ShardEval Error (Shard ${shardId})`)
        .setColor(shardResult.success ? COLORS.success : COLORS.error)
        .addFields(
          { name: 'Code', value: codeBlock('js', code.slice(0, 512)), inline: false },
          { name: 'Output', value: codeBlock('js', shardResult.output || 'undefined'), inline: false },
        )
        .setTimestamp();

      await m.reply({ embeds: [embed] });
    } catch (err: any) {
      await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ Error: ${err?.message}`)] });
    }
  }
}

export default ShardEvalCommand;
