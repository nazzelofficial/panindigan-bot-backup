import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class WorkoutCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'workout',
      description: 'Generate a workout plan using AI',
      category: 'ai',
      cooldown: 15,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['generateworkout', 'exercise'],
      examples: ['/workout upper body', 'p!workout cardio'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const focus = interaction.options.getString('focus') || 'general';
    const duration = interaction.options.getString('duration') || '30 minutes';

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} 💪 AI Workout Generator`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Focus', value: focus, inline: true },
        { name: 'Duration', value: duration, inline: true },
        { name: 'Workout Plan', value: 'This is a placeholder. AI workout generation will be implemented with the AIHandler.', inline: false },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const focus = args[0] || 'general';
    const duration = args[1] || '30 minutes';

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} 💪 AI Workout Generator`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Focus', value: focus, inline: true },
        { name: 'Duration', value: duration, inline: true },
        { name: 'Workout Plan', value: 'This is a placeholder. AI workout generation will be implemented with the AIHandler.', inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default WorkoutCommand;
