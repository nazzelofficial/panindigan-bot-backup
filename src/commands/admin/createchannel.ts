// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class CreateChannelCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'createchannel',
      description: 'Create a new text or voice channel',
      category: 'admin',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.ManageChannels],
      botPermissions: [PermissionFlagsBits.ManageChannels],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['makechannel', 'newchannel'],
      examples: ['/createchannel general text', 'p!createchannel lounge voice'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const name = interaction.options.getString('name');
    const type = interaction.options.getString('type') || 'text';
    const category = interaction.options.getChannel('category');

    if (!name) {
      await interaction.reply({ content: '❌ Please provide a channel name.', ephemeral: true });
      return;
    }

    if (!['text', 'voice'].includes(type)) {
      await interaction.reply({ content: '❌ Type must be either "text" or "voice".', ephemeral: true });
      return;
    }

    if (!interaction.guild) return;

    try {
      const channelData: any = {
        name,
        type: type === 'text' ? ChannelType.GuildText : ChannelType.GuildVoice,
      };

      if (category && category.type === ChannelType.GuildCategory) {
        channelData.parent = category.id;
      }

      const channel = await interaction.guild.channels.create(channelData);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Channel Created`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Name', value: channel.name, inline: true },
          { name: 'Type', value: type, inline: true },
          { name: 'ID', value: channel.id, inline: true },
          { name: 'Category', value: category ? category.name : 'None', inline: true },
          { name: 'Created by', value: interaction.user.tag, inline: false },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to create channel.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const name = args[0];
    const type = args[1]?.toLowerCase() || 'text';
    const category = message.mentions.channels.first();

    if (!name) {
      await message.reply('❌ Please provide a channel name.');
      return;
    }

    if (!['text', 'voice'].includes(type)) {
      await message.reply('❌ Type must be either "text" or "voice".');
      return;
    }

    if (!message.guild) return;

    try {
      const channelData: any = {
        name,
        type: type === 'text' ? ChannelType.GuildText : ChannelType.GuildVoice,
      };

      if (category && category.type === ChannelType.GuildCategory) {
        channelData.parent = category.id;
      }

      const channel = await message.guild.channels.create(channelData);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Channel Created`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Name', value: channel.name, inline: true },
          { name: 'Type', value: type, inline: true },
          { name: 'ID', value: channel.id, inline: true },
          { name: 'Category', value: category ? category.name : 'None', inline: true },
          { name: 'Created by', value: message.author.tag, inline: false },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to create channel.');
    }
  }
}

export default CreateChannelCommand;
