import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class CreateChannelCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'create-channel',
      description: 'Create a new channel',
      category: 'utility',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.ManageChannels],
      botPermissions: [PermissionFlagsBits.ManageChannels],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['createchannel'],
      examples: ['/create-channel general text', '/create-channel voice voice', 'p!create-channel general text'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const name = interaction.options.getString('name');
    const type = interaction.options.getString('type') || 'text';
    
    if (!name) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a name for the channel.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    try {
      const channelType = type === 'voice' ? ChannelType.GuildVoice : ChannelType.GuildText;
      const channel = await interaction.guild?.channels.create({
        name,
        type: channelType,
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Channel Created`)
        .setColor(COLORS.success)
        .setDescription(`Successfully created ${type} channel ${channel}!`)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Could not create channel. Make sure I have the required permissions.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
    }
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const name = args[0];
    const type = args[1] || 'text';

    if (!name) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a name for the channel.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    try {
      const channelType = type === 'voice' ? ChannelType.GuildVoice : ChannelType.GuildText;
      const channel = await message.guild?.channels.create({
        name,
        type: channelType,
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Channel Created`)
        .setColor(COLORS.success)
        .setDescription(`Successfully created ${type} channel ${channel}!`)
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Could not create channel. Make sure I have the required permissions.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
    }
  }
}

export default CreateChannelCommand;
