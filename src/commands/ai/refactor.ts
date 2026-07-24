import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PanindiganClient } from '../../structures/PanindiganClient';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class RefactorCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'refactor',
      description: 'Refactor code to be cleaner and more maintainable using AI',
      category: 'ai',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['clean', 'restructure'],
      examples: ['/refactor messy code here', 'p!refactor paste code to refactor'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o => o.setName('code').setDescription('Code to refactor').setRequired(true).setMaxLength(2000)) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const code = interaction.options.getString('code', true);
    await interaction.deferReply();
    try {
      const client = interaction.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        code,
        'You are a clean code expert. Refactor the following code to be cleaner, more readable, and more maintainable. Apply: SOLID principles, DRY, proper naming conventions, extract functions, remove magic numbers, add comments. Show the refactored code and explain the changes.'
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 🔨 Code Refactored`)
        .setColor(COLORS.info)
        .addFields(
          { name: '💻 Original', value: `\`\`\`\n${code.slice(0, 600)}\n\`\`\``, inline: false },
          { name: '✨ Refactored', value: response.content.slice(0, 3400), inline: false }
        )
        .setFooter({ text: `Provider: ${response.provider}` })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (err: any) {
      await interaction.editReply({ content: `${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}` });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const code = args.join(' ');
    if (!code) return void message.reply(`${EMOJIS.error} Please provide code to refactor.`);
    const thinking = await message.reply(`${EMOJIS.ai} Refactoring code...`);
    try {
      const client = message.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        code,
        'Refactor this code to be cleaner, more readable, and maintainable. Apply SOLID, DRY, proper naming. Show refactored code and explain changes.'
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 🔨 Code Refactored`)
        .setColor(COLORS.info)
        .addFields({ name: '✨ Refactored', value: response.content.slice(0, 3800), inline: false })
        .setFooter({ text: `Provider: ${response.provider}` })
        .setTimestamp();
      await thinking.edit({ content: null, embeds: [embed] });
    } catch (err: any) {
      await thinking.edit(`${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}`);
    }
  }
}

export default RefactorCommand;
