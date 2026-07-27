// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PanindiganClient } from '../../structures/PanindiganClient.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class FactCheckCommand extends BaseCommand {
  constructor() {
    super({
      name: 'factcheck',
      description: 'Fact-check a claim using AI (Gold+)',
      category: 'ai',
      premiumTier: 'gold',
      cooldown: 10,
      ownerOnly: false,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['verify', 'checkfact'],
      examples: ['/factcheck The Great Wall of China is visible from space', 'p!factcheck Water boils at 90°C at sea level'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o =>
        o.setName('claim').setDescription('The claim to fact-check').setRequired(true).setMaxLength(1000)
      )
      .setDMPermission(false) as SlashCommandBuilder;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const claim = i.options.getString('claim', true);
    await i.deferReply();
    try {
      const client = i.client as PanindiganClient;
      const prompt = `Fact-check the following claim carefully and objectively. Provide:
1. **Verdict** – TRUE / FALSE / PARTIALLY TRUE / UNVERIFIABLE (with a clear label)
2. **Explanation** – detailed explanation of the verdict
3. **Evidence** – what evidence supports or contradicts the claim
4. **Nuance** – any important caveats, context, or exceptions
5. **Confidence Level** – your confidence in this assessment (Low / Medium / High)

Important: Be objective. If the claim is outside your knowledge cutoff, state that clearly.

Claim: "${claim}"`;

      const response = await client.aiHandler.generateTaskResponse(claim, prompt);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 🔎 Fact Check`)
        .setColor(COLORS.warning)
        .addFields(
          { name: '📋 Claim', value: claim, inline: false },
          { name: '🔍 Verdict & Analysis', value: response.content.slice(0, 3800) || 'No result returned.', inline: false },
        )
        .setFooter({ text: `Provider: ${response.provider} • AI knowledge may be limited by training cutoff` })
        .setTimestamp();

      await i.editReply({ embeds: [embed] });
    } catch (err: any) {
      await i.editReply({ content: `${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}` });
    }
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    const claim = _args.join(' ');
    if (!claim) return void m.reply(`${EMOJIS.error} Please provide a claim to fact-check.`);
    const thinking = await m.reply(`${EMOJIS.ai} Fact-checking claim...`);
    try {
      const client = m.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        claim,
        'Fact-check this claim. Provide: verdict (TRUE/FALSE/PARTIALLY TRUE/UNVERIFIABLE), explanation, supporting or contradicting evidence, nuance, and confidence level.'
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 🔎 Fact Check`)
        .setColor(COLORS.warning)
        .addFields(
          { name: '📋 Claim', value: claim.slice(0, 512), inline: false },
          { name: '🔍 Verdict & Analysis', value: response.content.slice(0, 3800), inline: false },
        )
        .setFooter({ text: `Provider: ${response.provider} • AI knowledge may be limited by training cutoff` })
        .setTimestamp();
      await thinking.edit({ content: null, embeds: [embed] });
    } catch (err: any) {
      await thinking.edit(`${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}`);
    }
  }
}

export default FactCheckCommand;
