import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class UnlockCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'unlock',
      description: 'Unlock the current channel',
      category: 'utility',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.ManageChannels],
      botPermissions: [PermissionFlagsBits.ManageChannels],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: [],
      examples: ['/unlock', 'p!unlock'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const channel = interaction.channel as any;
    
    if (!('permissionOverwrites' in channel)) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('This command can only be used in server channels.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    try {
      await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
        SendMessages: null,
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} 🔓 Channel Unlocked`)
        .setColor(COLORS.success)
        .setDescription('This channel has been unlocked.')
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Could not unlock the channel. Make sure I have the required permissions.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
    }
  }

  public async executePrefix(message: Message): Promise<void> {
    const channel = message.channel as any;
    
    if (!('permissionOverwrites' in channel)) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('This command can only be used in server channels.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    try {
      await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
        SendMessages: null,
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} 🔓 Channel Unlocked`)
        .setColor(COLORS.success)
        .setDescription('This channel has been unlocked.')
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Could not unlock the channel. Make sure I have the required permissions.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
    }
  }
}

export default UnlockCommand;
