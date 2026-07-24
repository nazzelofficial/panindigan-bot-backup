import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class AvatarCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'avatar',
      description: 'Display a user\'s avatar',
      category: 'fun',
      cooldown: 3,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['pfp', 'profilepic'],
      examples: ['/avatar', '/avatar @user', 'p!avatar @user'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('user') || interaction.user;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} ${user.username}'s Avatar`)
      .setColor(COLORS.info)
      .setImage(user.displayAvatarURL({ size: 4096, extension: 'png' }))
      .addFields([
        { name: 'Username', value: user.username, inline: true },
        { name: 'ID', value: user.id, inline: true },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const user = message.mentions.users.first() || message.author;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} ${user.username}'s Avatar`)
      .setColor(COLORS.info)
      .setImage(user.displayAvatarURL({ size: 4096, extension: 'png' }))
      .addFields([
        { name: 'Username', value: user.username, inline: true },
        { name: 'ID', value: user.id, inline: true },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default AvatarCommand;
