import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class EmbedCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'embed',
      description: 'Create a custom embed message',
      category: 'utility',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.ManageMessages],
      botPermissions: [PermissionFlagsBits.ManageMessages],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: [],
      examples: ['/embed title description', 'p!embed Hello World This is a test'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const title = interaction.options.getString('title');
    const description = interaction.options.getString('description');
    
    if (!title) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a title for the embed.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setColor(COLORS.info)
      .setDescription(description || '')
      .setFooter({ text: `Created by ${interaction.user.username}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const title = args[0];
    const description = args.slice(1).join(' ');

    if (!title) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a title for the embed.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setColor(COLORS.info)
      .setDescription(description || '')
      .setFooter({ text: `Created by ${message.author.username}` })
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });
  }
}

export default EmbedCommand;
