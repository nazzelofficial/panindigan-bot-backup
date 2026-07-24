import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class KickCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'kick',
      description: 'Kick a user from the server',
      category: 'utility',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.KickMembers],
      botPermissions: [PermissionFlagsBits.KickMembers],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: [],
      examples: ['/kick @user', '/kick @user Breaking rules', 'p!kick @user'],
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
        .setDescription('Please provide a user to kick.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const member = await interaction.guild?.members.fetch(user.id);
    if (!member) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Could not find that member.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    try {
      await member.kick(reason);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} User Kicked`)
        .setColor(COLORS.success)
        .setDescription(`${user} has been kicked from the server.\n**Reason:** ${reason}`)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Could not kick user. Make sure I have the required permissions and the user is not higher in role hierarchy.')
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
        .setDescription('Please provide a user to kick.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const member = await message.guild?.members.fetch(user.id);
    if (!member) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Could not find that member.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    try {
      await member.kick(reason);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} User Kicked`)
        .setColor(COLORS.success)
        .setDescription(`${user} has been kicked from the server.\n**Reason:** ${reason}`)
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Could not kick user. Make sure I have the required permissions and the user is not higher in role hierarchy.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
    }
  }
}

export default KickCommand;
