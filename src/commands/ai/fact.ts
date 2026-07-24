import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class FactCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'fact',
      description: 'Generate a fact using AI',
      category: 'ai',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['generatefact', 'trivia'],
      examples: ['/fact about space', 'p!fact about history'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const topic = interaction.options.getString('topic') || 'general';

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} 📚 AI Fact Generator`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Topic', value: topic, inline: true },
        { name: 'Fact', value: 'This is a placeholder. AI fact generation will be implemented with the AIHandler.', inline: false },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const topic = args.join(' ') || 'general';

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} 📚 AI Fact Generator`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Topic', value: topic, inline: true },
        { name: 'Fact', value: 'This is a placeholder. AI fact generation will be implemented with the AIHandler.', inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default FactCommand;
