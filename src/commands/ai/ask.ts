// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PanindiganClient } from '../../structures/PanindiganClient.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class AskCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'ask',
      description: 'Ask AI a question',
      category: 'ai',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['question', 'inquire'],
      examples: ['/ask what is the meaning of life', 'p!ask how do I code'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o => o.setName('question').setDescription('The question to ask').setRequired(true)) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const question = interaction.options.getString('question', true);
    await interaction.deferReply();
    try {
      const client = interaction.client as PanindiganClient;
      const response = await client.aiHandler.generateResponse(
        interaction.user.id,
        interaction.guildId || 'dm',
        question
      );
      const answer = response.content.slice(0, 4000);
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} ❓ AI Answer`)
        .setColor(COLORS.info)
        .addFields(
          { name: '❓ Question', value: question.slice(0, 1024), inline: false },
          { name: '💡 Answer', value: answer || 'No response.', inline: false }
        )
        .setFooter({ text: `Provider: ${response.provider} • Model: ${response.model}` })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (err: any) {
      await interaction.editReply({ content: `${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}` });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const question = _args.join(' ');
    if (!question) return void message.reply(`${EMOJIS.error} Please provide a question.`);
    const thinking = await message.reply(`${EMOJIS.ai} Thinking...`);
    try {
      const client = message.client as PanindiganClient;
      const response = await client.aiHandler.generateResponse(
        message.author.id,
        message.guildId || 'dm',
        question
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} ❓ AI Answer`)
        .setColor(COLORS.info)
        .addFields(
          { name: '❓ Question', value: question.slice(0, 1024), inline: false },
          { name: '💡 Answer', value: response.content.slice(0, 4000) || 'No response.', inline: false }
        )
        .setFooter({ text: `Provider: ${response.provider} • Model: ${response.model}` })
        .setTimestamp();
      await thinking.edit({ content: null, embeds: [embed] });
    } catch (err: any) {
      await thinking.edit(`${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}`);
    }
  }
}

export default AskCommand;
