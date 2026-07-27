// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PanindiganClient } from '../../structures/PanindiganClient.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class ParaphraseCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'paraphrase',
      description: 'Rephrase text in a different way using AI',
      category: 'ai',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['rephrase', 'reword'],
      examples: ['/paraphrase The quick brown fox', 'p!paraphrase I am very tired today'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o => o.setName('text').setDescription('Text to paraphrase').setRequired(true).setMaxLength(2000))
      .addStringOption(o => o.setName('style').setDescription('Output style').setRequired(false)
        .addChoices(
          { name: 'Standard', value: 'standard' },
          { name: 'Formal', value: 'formal' },
          { name: 'Casual', value: 'casual' },
          { name: 'Creative', value: 'creative' }
        )) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const text = interaction.options.getString('text', true);
    const style = interaction.options.getString('style') || 'standard';
    await interaction.deferReply();
    try {
      const client = interaction.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        text,
        `You are a paraphrasing expert. Rewrite the following text in a ${style} style while preserving the original meaning. Make it sound natural and different from the original. Provide only the paraphrased version.`
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 🔄 Paraphrase`)
        .setColor(COLORS.info)
        .addFields(
          { name: '📝 Original', value: text.slice(0, 1024), inline: false },
          { name: `✨ Paraphrased (${style})`, value: response.content.slice(0, 3000), inline: false }
        )
        .setFooter({ text: `Provider: ${response.provider}` })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (err: any) {
      await interaction.editReply({ content: `${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}` });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const text = _args.join(' ');
    if (!text) return void message.reply(`${EMOJIS.error} Please provide text to paraphrase.`);
    const thinking = await message.reply(`${EMOJIS.ai} Paraphrasing...`);
    try {
      const client = message.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        text,
        'Paraphrase the text in a natural, different way while preserving the original meaning.'
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 🔄 Paraphrase`)
        .setColor(COLORS.info)
        .addFields(
          { name: '📝 Original', value: text.slice(0, 1024), inline: false },
          { name: '✨ Paraphrased', value: response.content.slice(0, 3000), inline: false }
        )
        .setFooter({ text: `Provider: ${response.provider}` })
        .setTimestamp();
      await thinking.edit({ content: null, embeds: [embed] });
    } catch (err: any) {
      await thinking.edit(`${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}`);
    }
  }
}

export default ParaphraseCommand;
