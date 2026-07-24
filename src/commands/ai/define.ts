import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PanindiganClient } from '../../structures/PanindiganClient';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class DefineCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'define',
      description: 'Get an AI-powered definition of a word or phrase',
      category: 'ai',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['def', 'dictionary'],
      examples: ['/define ephemeral', 'p!define machine learning'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o => o.setName('term').setDescription('Word or phrase to define').setRequired(true)) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const term = interaction.options.getString('term', true);
    await interaction.deferReply();
    try {
      const client = interaction.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        term,
        'You are a dictionary and encyclopedia. Define the given word or phrase with: 1) A clear, concise definition. 2) Part of speech (if applicable). 3) Etymology (if known). 4) 2-3 example sentences. 5) Synonyms and antonyms (if applicable). Format it clearly.'
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 📖 Definition: ${term}`)
        .setColor(COLORS.info)
        .setDescription(response.content.slice(0, 4000))
        .setFooter({ text: `Provider: ${response.provider}` })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (err: any) {
      await interaction.editReply({ content: `${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}` });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const term = args.join(' ');
    if (!term) return void message.reply(`${EMOJIS.error} Please provide a term to define.`);
    const thinking = await message.reply(`${EMOJIS.ai} Looking up definition...`);
    try {
      const client = message.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        term,
        'You are a dictionary. Define the given word with: definition, part of speech, etymology, example sentences, and synonyms.'
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 📖 Definition: ${term}`)
        .setColor(COLORS.info)
        .setDescription(response.content.slice(0, 4000))
        .setFooter({ text: `Provider: ${response.provider}` })
        .setTimestamp();
      await thinking.edit({ content: null, embeds: [embed] });
    } catch (err: any) {
      await thinking.edit(`${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}`);
    }
  }
}

export default DefineCommand;
