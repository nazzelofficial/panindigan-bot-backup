import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class DeafenCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'deafen',
      description: 'Deafen a user in voice channels',
      category: 'utility',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.ModerateMembers],
      botPermissions: [PermissionFlagsBits.ModerateMembers],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: [],
      examples: ['/deafen @user', 'p!deafen @user'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('user');
    
    if (!user) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a user to deafen.')
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
      await member.voice.setDeaf(true);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} User Deafened`)
        .setColor(COLORS.success)
        .setDescription(`${user} has been deafened in voice channels.`)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Could not deafen user. Make sure I have the required permissions and the user is not higher in role hierarchy.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
    }
  }

  public async executePrefix(message: Message): Promise<void> {
    const user = message.mentions.users.first();

    if (!user) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a user to deafen.')
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
      await member.voice.setDeaf(true);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} User Deafened`)
        .setColor(COLORS.success)
        .setDescription(`${user} has been deafened in voice channels.`)
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Could not deafen user. Make sure I have the required permissions and the user is not higher in role hierarchy.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
    }
  }
}

export default DeafenCommand;
