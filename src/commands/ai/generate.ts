import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class GenerateCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'generate',
      description: 'Generate names, ideas, or content using AI',
      category: 'ai',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['gen', 'create'],
      examples: ['/generate name fantasy', 'p!generate idea for server event'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const type = interaction.options.getString('type') || '';
    const topic = interaction.options.getString('topic') || '';

    if (!type) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please specify what to generate (name, idea, etc.).')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} 🎨 AI Generator`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Type', value: type, inline: true },
        { name: 'Topic', value: topic || 'Random', inline: false },
        { name: 'Generated', value: 'This is a placeholder. AI generation will be implemented with the AIHandler.', inline: false },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const type = args[0] || '';
    const topic = args.slice(1).join(' ');

    if (!type) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please specify what to generate (name, idea, etc.).')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} 🎨 AI Generator`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Type', value: type, inline: true },
        { name: 'Topic', value: topic || 'Random', inline: false },
        { name: 'Generated', value: 'This is a placeholder. AI generation will be implemented with the AIHandler.', inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default GenerateCommand;
