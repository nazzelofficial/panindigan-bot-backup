import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PanindiganClient } from '../../structures/PanindiganClient';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class ExplainCodeCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'explaincode',
      description: 'Explain code in simple terms using AI',
      category: 'ai',
      cooldown: 8,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: [],
      examples: ['/explaincode async function fetchData() {...}', 'p!explaincode your code here'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o => o.setName('code').setDescription('Code to explain').setRequired(true).setMaxLength(2000))
      .addStringOption(o => o.setName('level').setDescription('Audience level').setRequired(false)
        .addChoices(
          { name: 'Beginner', value: 'beginner' },
          { name: 'Intermediate', value: 'intermediate' },
          { name: 'Expert', value: 'expert' }
        )) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const code = interaction.options.getString('code', true);
    const level = interaction.options.getString('level') || 'intermediate';
    await interaction.deferReply();
    try {
      const client = interaction.client as PanindiganClient;
      const audienceDesc = level === 'beginner' ? 'a complete beginner with no programming knowledge' :
                           level === 'expert' ? 'an experienced developer' : 'someone with basic programming knowledge';
      const response = await client.aiHandler.generateTaskResponse(
        code,
        `Explain the following code clearly for ${audienceDesc}. Break it down into understandable parts, use analogies if helpful, and explain what it accomplishes.`
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 💡 Code Explained (${level})`)
        .setColor(COLORS.info)
        .addFields(
          { name: '💻 Code', value: `\`\`\`\n${code.slice(0, 800)}\n\`\`\``, inline: false },
          { name: '📖 Explanation', value: response.content.slice(0, 3200), inline: false }
        )
        .setFooter({ text: `Level: ${level} | Provider: ${response.provider}` })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (err: any) {
      await interaction.editReply({ content: `${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}` });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const code = args.join(' ');
    if (!code) return void message.reply(`${EMOJIS.error} Please provide code to explain.`);
    const thinking = await message.reply(`${EMOJIS.ai} Explaining code...`);
    try {
      const client = message.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        code,
        'Explain this code clearly for someone with basic programming knowledge.'
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 💡 Code Explained`)
        .setColor(COLORS.info)
        .addFields({ name: '📖 Explanation', value: response.content.slice(0, 3800), inline: false })
        .setFooter({ text: `Provider: ${response.provider}` })
        .setTimestamp();
      await thinking.edit({ content: null, embeds: [embed] });
    } catch (err: any) {
      await thinking.edit(`${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}`);
    }
  }
}

export default ExplainCodeCommand;
