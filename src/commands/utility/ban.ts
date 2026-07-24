import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class BanCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'ban',
      description: 'Ban a user from the server',
      category: 'utility',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.BanMembers],
      botPermissions: [PermissionFlagsBits.BanMembers],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: [],
      examples: ['/ban @user', '/ban @user Breaking rules', 'p!ban @user'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    
    if (!user) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a user to ban.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    try {
      await interaction.guild?.bans.create(user.id, { reason });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} User Banned`)
        .setColor(COLORS.success)
        .setDescription(`${user} has been banned from the server.\n**Reason:** ${reason}`)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Could not ban user. Make sure I have the required permissions and the user is not higher in role hierarchy.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
    }
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const user = message.mentions.users.first();
    const reason = args.slice(1).join(' ') || 'No reason provided';

    if (!user) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a user to ban.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    try {
      await message.guild?.bans.create(user.id, { reason });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} User Banned`)
        .setColor(COLORS.success)
        .setDescription(`${user} has been banned from the server.\n**Reason:** ${reason}`)
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Could not ban user. Make sure I have the required permissions and the user is not higher in role hierarchy.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
    }
  }
}

export default BanCommand;
