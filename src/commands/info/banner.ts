// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, User } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class BannerCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'banner',
      description: 'Display a user banner',
      category: 'info',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['userbanner'],
      examples: ['/banner', '/banner @user', 'p!banner @user'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getUser('user') || interaction.user;
    
    const user = await target.fetch();
    const bannerUrl = user.bannerURL({ size: 4096, extension: 'png' });

    if (!bannerUrl) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('This user does not have a banner.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} ${target.username}'s Banner`)
      .setColor(COLORS.info)
      .setImage(bannerUrl)
      .setDescription(`[Download](${bannerUrl})`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const target = message.mentions.users.first() || message.author;
    
    const user = await target.fetch();
    const bannerUrl = user.bannerURL({ size: 4096, extension: 'png' });

    if (!bannerUrl) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('This user does not have a banner.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} ${target.username}'s Banner`)
      .setColor(COLORS.info)
      .setImage(bannerUrl)
      .setDescription(`[Download](${bannerUrl})`)
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default BannerCommand;
