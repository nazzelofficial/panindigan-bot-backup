import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class NickCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'nick',
      description: 'Change a user\'s nickname',
      category: 'utility',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.ManageNicknames],
      botPermissions: [PermissionFlagsBits.ManageNicknames],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['nickname'],
      examples: ['/nick @user NewNick', '/nick @user reset', 'p!nick @user NewNick'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('user');
    const nickname = interaction.options.getString('nickname');

    if (!user) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a user.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    if (!nickname) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a nickname or "reset" to remove it.')
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
      const newNick = nickname === 'reset' ? null : nickname;
      await member.setNickname(newNick);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Nickname Changed`)
        .setColor(COLORS.success)
        .setDescription(`${user}'s nickname has been ${newNick ? `changed to "${newNick}"` : 'reset'}.`)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Could not change nickname. Make sure I have the required permissions and the user is not higher in role hierarchy.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
    }
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const user = message.mentions.users.first();
    const nickname = args.slice(1).join(' ');

    if (!user) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a user.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    if (!nickname) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a nickname or "reset" to remove it.')
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
      const newNick = nickname === 'reset' ? null : nickname;
      await member.setNickname(newNick);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} Nickname Changed`)
        .setColor(COLORS.success)
        .setDescription(`${user}'s nickname has been ${newNick ? `changed to "${newNick}"` : 'reset'}.`)
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Could not change nickname. Make sure I have the required permissions and the user is not higher in role hierarchy.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
    }
  }
}

export default NickCommand;
