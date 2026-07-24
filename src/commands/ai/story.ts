import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class StoryCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'story',
      description: 'Generate a story using AI',
      category: 'ai',
      cooldown: 15,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['generatestory', 'tale'],
      examples: ['/story about a dragon', 'p!story sci-fi adventure'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const prompt = interaction.options.getString('prompt') || '';
    if (!prompt) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a prompt for story generation.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} 📖 AI Story Generator`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Prompt', value: prompt, inline: false },
        { name: 'Story', value: 'This is a placeholder. AI story generation will be implemented with the AIHandler.', inline: false },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const prompt = args.join(' ');

    if (!prompt) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a prompt for story generation.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} 📖 AI Story Generator`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Prompt', value: prompt, inline: false },
        { name: 'Story', value: 'This is a placeholder. AI story generation will be implemented with the AIHandler.', inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default StoryCommand;
