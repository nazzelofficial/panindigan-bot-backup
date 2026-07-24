import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class OutlineCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'outline',
      description: 'Generate AI outline for essay or presentation',
      category: 'ai',
      cooldown: 15,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['generateoutline', 'structure'],
      examples: ['/outline climate change essay', 'p!outline presentation about AI'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const topic = interaction.options.getString('topic') || '';
    const type = interaction.options.getString('type') || 'essay';

    if (!topic) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a topic for the outline.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} 📋 AI Outline Generator`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Type', value: type, inline: true },
        { name: 'Topic', value: topic, inline: false },
        { name: 'Outline', value: 'This is a placeholder. AI outline generation will be implemented with the AIHandler.', inline: false },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const topic = args.slice(0, -1).join(' ');
    const type = args[args.length - 1] || 'essay';

    if (!topic) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a topic for the outline.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} 📋 AI Outline Generator`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Type', value: type, inline: true },
        { name: 'Topic', value: topic, inline: false },
        { name: 'Outline', value: 'This is a placeholder. AI outline generation will be implemented with the AIHandler.', inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default OutlineCommand;
