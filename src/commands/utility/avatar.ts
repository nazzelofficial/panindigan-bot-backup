import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class AvatarCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'avatar',
      description: 'Display a user\'s avatar',
      category: 'utility',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['av', 'pfp'],
      examples: ['/avatar', '/avatar @user', 'p!avatar @user'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('user') || interaction.user;
    const avatarUrl = user.displayAvatarURL({ size: 4096, extension: 'png' });

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} ${user.username}'s Avatar`)
      .setColor(COLORS.info)
      .setImage(avatarUrl)
      .setDescription(`[Download](${avatarUrl})`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const user = message.mentions.users.first() || message.author;
    const avatarUrl = user.displayAvatarURL({ size: 4096, extension: 'png' });

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} ${user.username}'s Avatar`)
      .setColor(COLORS.info)
      .setImage(avatarUrl)
      .setDescription(`[Download](${avatarUrl})`)
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default AvatarCommand;
