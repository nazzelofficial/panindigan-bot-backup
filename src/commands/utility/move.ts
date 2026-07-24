import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits, VoiceChannel } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class MoveCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'move',
      description: 'Move a user to another voice channel',
      category: 'utility',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.MoveMembers],
      botPermissions: [PermissionFlagsBits.MoveMembers],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: [],
      examples: ['/move @user #channel', 'p!move @user #channel'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('user');
    const channel = interaction.options.getChannel('channel');
    
    if (!user) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a user to move.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    if (!channel || channel.type !== 2) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a valid voice channel.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const member = await interaction.guild?.members.fetch(user.id);
    if (!member || !member.voice.channel) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('That user is not in a voice channel.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    try {
      await member.voice.setChannel(channel as VoiceChannel);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} User Moved`)
        .setColor(COLORS.success)
        .setDescription(`${user} has been moved to ${channel}.`)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Could not move user. Make sure I have the required permissions and the user is not higher in role hierarchy.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
    }
  }

  public async executePrefix(message: Message): Promise<void> {
    const user = message.mentions.users.first();
    const channel = message.mentions.channels.first();
    
    if (!user) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a user to move.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    if (!channel || channel.type !== 2) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a valid voice channel.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const member = await message.guild?.members.fetch(user.id);
    if (!member || !member.voice.channel) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('That user is not in a voice channel.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    try {
      await member.voice.setChannel(channel as VoiceChannel);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} User Moved`)
        .setColor(COLORS.success)
        .setDescription(`${user} has been moved to ${channel}.`)
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Could not move user. Make sure I have the required permissions and the user is not higher in role hierarchy.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
    }
  }
}

export default MoveCommand;
