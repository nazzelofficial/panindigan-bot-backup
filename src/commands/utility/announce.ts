import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class AnnounceCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'announce',
      description: 'Make an announcement in the current channel',
      category: 'utility',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.ManageMessages],
      botPermissions: [PermissionFlagsBits.ManageMessages],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: [],
      examples: ['/announce Hello everyone!', 'p!announce Important update'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const message = interaction.options.getString('message');
    
    if (!message) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a message to announce.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 📢 Announcement`)
      .setColor(COLORS.info)
      .setDescription(message)
      .setFooter({ text: `From ${interaction.user.username}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const announcement = args.join(' ');

    if (!announcement) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a message to announce.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 📢 Announcement`)
      .setColor(COLORS.info)
      .setDescription(announcement)
      .setFooter({ text: `From ${message.author.username}` })
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });
  }
}

export default AnnounceCommand;
