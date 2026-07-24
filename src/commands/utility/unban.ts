import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class UnbanCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'unban',
      description: 'Unban a user from the server',
      category: 'utility',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.BanMembers],
      botPermissions: [PermissionFlagsBits.BanMembers],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: [],
      examples: ['/unban userid', '/unban userid', 'p!unban userid'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const userId = interaction.options.getString('userid');
    
    if (!userId) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a user ID to unban.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    try {
      await interaction.guild?.bans.remove(userId);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} User Unbanned`)
        .setColor(COLORS.success)
        .setDescription(`User with ID ${userId} has been unbanned from the server.`)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Could not unban user. Make sure I have the required permissions and the user ID is correct.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
    }
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const userId = args[0];

    if (!userId) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a user ID to unban.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    try {
      await message.guild?.bans.remove(userId);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} User Unbanned`)
        .setColor(COLORS.success)
        .setDescription(`User with ID ${userId} has been unbanned from the server.`)
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Could not unban user. Make sure I have the required permissions and the user ID is correct.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
    }
  }
}

export default UnbanCommand;
