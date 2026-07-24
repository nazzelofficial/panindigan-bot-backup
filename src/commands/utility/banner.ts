import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class BannerCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'banner',
      description: 'Display a user\'s banner',
      category: 'utility',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: [],
      examples: ['/banner', '/banner @user', 'p!banner @user'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('user') || interaction.user;
    
    await interaction.deferReply();
    const fetchedUser = await interaction.client.users.fetch(user.id, { force: true });
    const bannerUrl = fetchedUser.bannerURL({ size: 4096, extension: 'png' });

    if (!bannerUrl) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription(`${user} does not have a banner.`)
        .setTimestamp();

      await interaction.editReply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} ${user.username}'s Banner`)
      .setColor(COLORS.info)
      .setImage(bannerUrl)
      .setDescription(`[Download](${bannerUrl})`)
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const user = message.mentions.users.first() || message.author;
    
    const fetchedUser = await message.client.users.fetch(user.id, { force: true });
    const bannerUrl = fetchedUser.bannerURL({ size: 4096, extension: 'png' });

    if (!bannerUrl) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription(`${user} does not have a banner.`)
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} ${user.username}'s Banner`)
      .setColor(COLORS.info)
      .setImage(bannerUrl)
      .setDescription(`[Download](${bannerUrl})`)
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default BannerCommand;
