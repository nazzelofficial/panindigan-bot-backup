import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class JokeCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'joke',
      description: 'Generate a joke using AI',
      category: 'ai',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['generatejoke', 'funny'],
      examples: ['/joke', 'p!joke'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const topic = interaction.options.getString('topic') || 'general';

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} 😂 AI Joke Generator`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Topic', value: topic, inline: true },
        { name: 'Joke', value: 'This is a placeholder. AI joke generation will be implemented with the AIHandler.', inline: false },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const topic = args.join(' ') || 'general';

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} 😂 AI Joke Generator`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Topic', value: topic, inline: true },
        { name: 'Joke', value: 'This is a placeholder. AI joke generation will be implemented with the AIHandler.', inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default JokeCommand;
