// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PanindiganClient } from '../../structures/PanindiganClient.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class TestCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'test',
      description: 'Generate unit tests for code using AI',
      category: 'ai',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['unittest', 'tests'],
      examples: ['/test function add(a, b) { return a + b }', 'p!test paste function here'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o => o.setName('code').setDescription('Code to write tests for').setRequired(true).setMaxLength(2000))
      .addStringOption(o => o.setName('framework').setDescription('Test framework').setRequired(false)
        .addChoices(
          { name: 'Jest (JavaScript)', value: 'Jest' },
          { name: 'Vitest', value: 'Vitest' },
          { name: 'Mocha', value: 'Mocha' },
          { name: 'pytest (Python)', value: 'pytest' },
          { name: 'JUnit (Java)', value: 'JUnit' }
        )) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const code = interaction.options.getString('code', true);
    const framework = interaction.options.getString('framework') || 'Jest';
    await interaction.deferReply();
    try {
      const client = interaction.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        code,
        `Write comprehensive ${framework} unit tests for the following code. Include: 1) Happy path tests. 2) Edge cases and boundary conditions. 3) Error handling tests. 4) Mocks/stubs where needed. Follow ${framework} best practices. Add descriptive test names.`
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 🧪 Unit Tests Generated`)
        .setColor(COLORS.success)
        .addFields(
          { name: '💻 Code', value: `\`\`\`\n${code.slice(0, 500)}\n\`\`\``, inline: false },
          { name: `🧪 ${framework} Tests`, value: response.content.slice(0, 3500), inline: false }
        )
        .setFooter({ text: `Framework: ${framework} | Provider: ${response.provider}` })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (err: any) {
      await interaction.editReply({ content: `${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}` });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const code = _args.join(' ');
    if (!code) return void message.reply(`${EMOJIS.error} Please provide code to test.`);
    const thinking = await message.reply(`${EMOJIS.ai} Generating tests...`);
    try {
      const client = message.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        code,
        'Write comprehensive Jest unit tests: happy path, edge cases, error handling, with descriptive test names.'
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 🧪 Unit Tests Generated`)
        .setColor(COLORS.success)
        .addFields({ name: '🧪 Tests', value: response.content.slice(0, 3800), inline: false })
        .setFooter({ text: `Provider: ${response.provider}` })
        .setTimestamp();
      await thinking.edit({ content: null, embeds: [embed] });
    } catch (err: any) {
      await thinking.edit(`${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}`);
    }
  }
}

export default TestCommand;
