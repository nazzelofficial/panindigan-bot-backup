import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PanindiganClient } from '../../structures/PanindiganClient';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class ChatCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'chat',
      description: 'Have a conversation with AI (with memory)',
      category: 'ai',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['talk', 'ai'],
      examples: ['/chat Hello!', 'p!chat Tell me a story'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o => o.setName('message').setDescription('Your message to the AI').setRequired(true)) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const userMessage = interaction.options.getString('message', true);
    await interaction.deferReply();
    try {
      const client = interaction.client as PanindiganClient;
      const response = await client.aiHandler.generateResponse(
        interaction.user.id,
        interaction.guildId || 'dm',
        userMessage
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 💬 AI Chat`)
        .setColor(COLORS.primary)
        .addFields(
          { name: `${interaction.user.username}`, value: userMessage.slice(0, 1024), inline: false },
          { name: '🤖 Panindigan', value: response.content.slice(0, 4000) || 'No response.', inline: false }
        )
        .setThumbnail(interaction.user.displayAvatarURL())
        .setFooter({ text: `Provider: ${response.provider} • Model: ${response.model} | Use /aiclear to reset memory` })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (err: any) {
      await interaction.editReply({ content: `${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}` });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const userMessage = args.join(' ');
    if (!userMessage) return void message.reply(`${EMOJIS.error} Please provide a message.`);
    const thinking = await message.reply(`${EMOJIS.ai} Thinking...`);
    try {
      const client = message.client as PanindiganClient;
      const response = await client.aiHandler.generateResponse(
        message.author.id,
        message.guildId || 'dm',
        userMessage
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 💬 AI Chat`)
        .setColor(COLORS.primary)
        .addFields(
          { name: message.author.username, value: userMessage.slice(0, 1024), inline: false },
          { name: '🤖 Panindigan', value: response.content.slice(0, 4000) || 'No response.', inline: false }
        )
        .setFooter({ text: `Provider: ${response.provider} • Model: ${response.model}` })
        .setTimestamp();
      await thinking.edit({ content: null, embeds: [embed] });
    } catch (err: any) {
      await thinking.edit(`${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}`);
    }
  }
}

export default ChatCommand;
