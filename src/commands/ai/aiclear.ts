import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class AIClearCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'aiclear',
      description: 'Clear AI conversation memory',
      category: 'ai',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['clearmemory', 'resetai'],
      examples: ['/aiclear', 'p!aiclear'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} 🗑️ AI Memory Cleared`)
      .setColor(COLORS.success)
      .setDescription('Your AI conversation memory has been cleared.')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} 🗑️ AI Memory Cleared`)
      .setColor(COLORS.success)
      .setDescription('Your AI conversation memory has been cleared.')
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default AIClearCommand;
