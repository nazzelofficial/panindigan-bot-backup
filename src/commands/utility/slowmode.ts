import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class SlowmodeCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'slowmode',
      description: 'Set slowmode for the current channel',
      category: 'utility',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.ManageChannels],
      botPermissions: [PermissionFlagsBits.ManageChannels],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: [],
      examples: ['/slowmode 5', '/slowmode off', 'p!slowmode 10'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const duration = interaction.options.getString('duration') || 'off';
    const channel = interaction.channel as any;
    
    if (!('setRateLimitPerUser' in channel)) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('This command can only be used in server channels.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    let seconds = 0;
    if (duration !== 'off') {
      seconds = parseInt(duration);
      if (isNaN(seconds) || seconds < 0 || seconds > 21600) {
        const errorEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Error`)
          .setColor(COLORS.error)
          .setDescription('Please provide a valid duration between 0 and 21600 seconds, or "off".')
          .setTimestamp();

        await interaction.reply({ embeds: [errorEmbed] });
        return;
      }
    }

    try {
      await channel.setRateLimitPerUser(seconds);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} 🐌 Slowmode Set`)
        .setColor(COLORS.success)
        .setDescription(`Slowmode has been set to ${seconds === 0 ? 'off' : `${seconds} seconds`}.`)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Could not set slowmode. Make sure I have the required permissions.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
    }
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const duration = args[0] || 'off';
    const channel = message.channel as any;
    
    if (!('setRateLimitPerUser' in channel)) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('This command can only be used in server channels.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    let seconds = 0;
    if (duration !== 'off') {
      seconds = parseInt(duration);
      if (isNaN(seconds) || seconds < 0 || seconds > 21600) {
        const errorEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Error`)
          .setColor(COLORS.error)
          .setDescription('Please provide a valid duration between 0 and 21600 seconds, or "off".')
          .setTimestamp();

        await message.reply({ embeds: [errorEmbed] });
        return;
      }
    }

    try {
      await channel.setRateLimitPerUser(seconds);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} 🐌 Slowmode Set`)
        .setColor(COLORS.success)
        .setDescription(`Slowmode has been set to ${seconds === 0 ? 'off' : `${seconds} seconds`}.`)
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Could not set slowmode. Make sure I have the required permissions.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
    }
  }
}

export default SlowmodeCommand;
