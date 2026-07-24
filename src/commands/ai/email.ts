import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class EmailCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'email',
      description: 'Generate an email using AI',
      category: 'ai',
      cooldown: 15,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['generateemail', 'mail'],
      examples: ['/email request meeting', 'p!email thank you note'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const topic = interaction.options.getString('topic') || '';
    const tone = interaction.options.getString('tone') || 'professional';

    if (!topic) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a topic for email generation.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} 📧 AI Email Generator`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Topic', value: topic, inline: true },
        { name: 'Tone', value: tone, inline: true },
        { name: 'Email', value: 'This is a placeholder. AI email generation will be implemented with the AIHandler.', inline: false },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const topic = args.slice(0, -1).join(' ');
    const tone = args[args.length - 1] || 'professional';

    if (!topic) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a topic for email generation.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} 📧 AI Email Generator`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Topic', value: topic, inline: true },
        { name: 'Tone', value: tone, inline: true },
        { name: 'Email', value: 'This is a placeholder. AI email generation will be implemented with the AIHandler.', inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default EmailCommand;
