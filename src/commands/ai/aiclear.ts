import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PanindiganClient } from '../../structures/PanindiganClient';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class AiClearCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'aiclear',
      description: 'Clear your AI conversation memory',
      category: 'ai',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['clearmemory', 'aiforget', 'resetai'],
      examples: ['/aiclear', 'p!aiclear'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });
    try {
      const client = interaction.client as PanindiganClient;
      await client.aiHandler.clearConversationMemory(
        interaction.user.id,
        interaction.guildId || 'dm'
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 🧹 Memory Cleared`)
        .setColor(COLORS.success)
        .setDescription('Your AI conversation memory has been cleared. The next message will start a fresh conversation.')
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (err: any) {
      await interaction.editReply({ content: `${EMOJIS.error} Error clearing memory: ${err.message}` });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    try {
      const client = message.client as PanindiganClient;
      await client.aiHandler.clearConversationMemory(
        message.author.id,
        message.guildId || 'dm'
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 🧹 Memory Cleared`)
        .setColor(COLORS.success)
        .setDescription('Your AI conversation memory has been cleared. Fresh start! 🌟')
        .setTimestamp();
      await message.reply({ embeds: [embed] });
    } catch (err: any) {
      await message.reply(`${EMOJIS.error} Error clearing memory: ${err.message}`);
    }
  }
}

export default AiClearCommand;
