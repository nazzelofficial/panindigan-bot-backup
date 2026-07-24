import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class ProfileCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'profile',
      description: 'Display a user\'s profile',
      category: 'utility',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: [],
      examples: ['/profile', '/profile @user', 'p!profile'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('user') || interaction.user;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Profile: ${user.username}`)
      .setColor(COLORS.info)
      .setThumbnail(user.displayAvatarURL())
      .setDescription('This is a placeholder. Profile information will be implemented with database integration.')
      .addFields([
        { name: 'Level', value: 'N/A', inline: true },
        { name: 'XP', value: 'N/A', inline: true },
        { name: 'Reputation', value: 'N/A', inline: true },
        { name: 'Status', value: 'Database integration pending', inline: false },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const user = message.mentions.users.first() || message.author;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Profile: ${user.username}`)
      .setColor(COLORS.info)
      .setThumbnail(user.displayAvatarURL())
      .setDescription('This is a placeholder. Profile information will be implemented with database integration.')
      .addFields([
        { name: 'Level', value: 'N/A', inline: true },
        { name: 'XP', value: 'N/A', inline: true },
        { name: 'Reputation', value: 'N/A', inline: true },
        { name: 'Status', value: 'Database integration pending', inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default ProfileCommand;
