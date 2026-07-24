import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PanindiganClient } from '../../structures/PanindiganClient';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class WorkoutCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'workout',
      description: 'Get a personalized workout plan using AI',
      category: 'ai',
      cooldown: 8,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['exercise', 'fitness'],
      examples: ['/workout Lose weight, no equipment', 'p!workout Build muscle, gym access'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o => o.setName('goal').setDescription('Fitness goal and constraints').setRequired(true))
      .addStringOption(o => o.setName('level').setDescription('Fitness level').setRequired(false)
        .addChoices(
          { name: 'Beginner', value: 'beginner' },
          { name: 'Intermediate', value: 'intermediate' },
          { name: 'Advanced', value: 'advanced' }
        )) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const goal = interaction.options.getString('goal', true);
    const level = interaction.options.getString('level') || 'beginner';
    await interaction.deferReply();
    try {
      const client = interaction.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        goal,
        `You are a certified personal trainer. Create a practical workout plan for a ${level} based on their goal. Include: 📅 Weekly schedule, 💪 Exercises with sets/reps/duration, ⏱️ Rest periods, 🔥 Warm-up and cool-down, 💡 Form tips and safety notes. Make it achievable and progressive.`
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 💪 Workout Plan`)
        .setColor(0x22c55e)
        .addFields(
          { name: '🎯 Goal', value: goal.slice(0, 256), inline: true },
          { name: '📊 Level', value: level, inline: true },
          { name: '📋 Plan', value: response.content.slice(0, 3500), inline: false }
        )
        .setFooter({ text: `Provider: ${response.provider}` })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (err: any) {
      await interaction.editReply({ content: `${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}` });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const goal = args.join(' ');
    if (!goal) return void message.reply(`${EMOJIS.error} Please describe your fitness goal.`);
    const thinking = await message.reply(`${EMOJIS.ai} Creating workout plan...`);
    try {
      const client = message.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        goal,
        'Create a practical workout plan: weekly schedule, exercises with sets/reps, rest periods, warm-up, and safety tips.'
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 💪 Workout Plan`)
        .setColor(0x22c55e)
        .setDescription(response.content.slice(0, 4000))
        .setFooter({ text: `Provider: ${response.provider}` })
        .setTimestamp();
      await thinking.edit({ content: null, embeds: [embed] });
    } catch (err: any) {
      await thinking.edit(`${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}`);
    }
  }
}

export default WorkoutCommand;
