import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class LockCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'lock',
      description: 'Lock the current channel',
      category: 'utility',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.ManageChannels],
      botPermissions: [PermissionFlagsBits.ManageChannels],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: [],
      examples: ['/lock', 'p!lock'],
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
        SendMessages: false,
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} 🔒 Channel Locked`)
        .setColor(COLORS.success)
        .setDescription('This channel has been locked.')
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Could not lock the channel. Make sure I have the required permissions.')
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
        SendMessages: false,
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} 🔒 Channel Locked`)
        .setColor(COLORS.success)
        .setDescription('This channel has been locked.')
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Could not lock the channel. Make sure I have the required permissions.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
    }
  }
}

export default LockCommand;
