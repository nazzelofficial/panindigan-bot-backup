import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class RemindCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'remind',
      description: 'Set a reminder',
      category: 'info',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['reminder'],
      examples: ['/remind 30m Take a break', 'p!remind 1h Meeting'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const time = interaction.options.getString('time') || '';
    const message = interaction.options.getString('message') || '';

    if (!time || !message) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide both time and message for the reminder.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.success} Reminder Set`)
      .setColor(COLORS.success)
      .setDescription(`Reminder set for ${time}: ${message}`)
      .addFields([
        { name: 'Status', value: 'This is a placeholder. Reminder system will be implemented with database integration.', inline: false },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const time = args[0] || '';
    const reminderMessage = args.slice(1).join(' ');

    if (!time || !reminderMessage) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide both time and message for the reminder.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.success} Reminder Set`)
      .setColor(COLORS.success)
      .setDescription(`Reminder set for ${time}: ${reminderMessage}`)
      .addFields([
        { name: 'Status', value: 'This is a placeholder. Reminder system will be implemented with database integration.', inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default RemindCommand;
