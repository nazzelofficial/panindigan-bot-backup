// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PanindiganClient } from '../../structures/PanindiganClient.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class BatchCommand extends BaseCommand {
  constructor() {
    super({
      name: 'batch',
      description: 'Process multiple AI prompts at once — max 5, pipe-separated (Diamond+)',
      category: 'ai',
      premiumTier: 'diamond',
      cooldown: 30,
      ownerOnly: false,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['batchai', 'multiprompt'],
      examples: ['/batch What is AI? | Explain quantum computing | Write a haiku', 'p!batch Prompt 1 | Prompt 2 | Prompt 3'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o =>
        o.setName('prompts')
          .setDescription('Pipe-separated prompts (e.g. "Prompt 1 | Prompt 2 | Prompt 3", max 5)')
          .setRequired(true)
          .setMaxLength(2000)
      )
      .setDMPermission(false) as SlashCommandBuilder;
  }

  private splitPrompts(raw: string): string[] {
    return raw.split('|').map(p => p.trim()).filter(p => p.length > 0).slice(0, 5);
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const raw = i.options.getString('prompts', true);
    const prompts = this.splitPrompts(raw);

    if (prompts.length === 0) {
      await i.reply({ content: `${EMOJIS.error} No valid prompts found. Separate prompts with \`|\`.`, ephemeral: true });
      return;
    }

    await i.deferReply();
    try {
      const client = i.client as PanindiganClient;
      const results = await Promise.all(
        prompts.map(prompt =>
          client.aiHandler.generateTaskResponse(prompt, 'Answer the following concisely and helpfully.')
            .then(r => ({ prompt, content: r.content, provider: r.provider }))
            .catch(err => ({ prompt, content: `Error: ${err.message || 'AI unavailable.'}`, provider: 'error' }))
        )
      );

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 📦 Batch AI Results (${results.length}/${prompts.length})`)
        .setColor(COLORS.diamond)
        .setFooter({ text: 'Diamond tier • Max 5 prompts per batch' })
        .setTimestamp();

      for (let idx = 0; idx < results.length; idx++) {
        const r = results[idx];
        embed.addFields({
          name: `#${idx + 1} — ${r.prompt.length > 60 ? r.prompt.slice(0, 57) + '...' : r.prompt}`,
          value: r.content.slice(0, 800) || 'No response.',
          inline: false,
        });
      }

      await i.editReply({ embeds: [embed] });
    } catch (err: any) {
      await i.editReply({ content: `${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}` });
    }
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    const raw = _args.join(' ');
    const prompts = this.splitPrompts(raw);

    if (prompts.length === 0) {
      return void m.reply(`${EMOJIS.error} No valid prompts. Separate with \`|\` (e.g. \`p!batch Prompt 1 | Prompt 2\`).`);
    }

    const thinking = await m.reply(`${EMOJIS.ai} Processing ${prompts.length} prompt(s)...`);
    try {
      const client = m.client as PanindiganClient;
      const results = await Promise.all(
        prompts.map(prompt =>
          client.aiHandler.generateTaskResponse(prompt, 'Answer the following concisely and helpfully.')
            .then(r => ({ prompt, content: r.content, provider: r.provider }))
            .catch(err => ({ prompt, content: `Error: ${err.message || 'AI unavailable.'}`, provider: 'error' }))
        )
      );

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 📦 Batch AI Results (${results.length})`)
        .setColor(COLORS.diamond)
        .setTimestamp();

      for (let idx = 0; idx < results.length; idx++) {
        const r = results[idx];
        embed.addFields({
          name: `#${idx + 1} — ${r.prompt.length > 60 ? r.prompt.slice(0, 57) + '...' : r.prompt}`,
          value: r.content.slice(0, 800) || 'No response.',
          inline: false,
        });
      }

      await thinking.edit({ content: null, embeds: [embed] });
    } catch (err: any) {
      await thinking.edit(`${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}`);
    }
  }
}

export default BatchCommand;
