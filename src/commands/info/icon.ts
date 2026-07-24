import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class IconCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'icon',
      description: 'Display the server icon',
      category: 'info',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['servericon', 'guildicon'],
      examples: ['/icon', 'p!icon'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const guild = interaction.guild!;
    const iconUrl = guild.iconURL({ size: 4096, extension: 'png' });

    if (!iconUrl) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('This server does not have an icon.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} ${guild.name}'s Icon`)
      .setColor(COLORS.info)
      .setImage(iconUrl)
      .setDescription(`[Download](${iconUrl})`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const guild = message.guild!;
    const iconUrl = guild.iconURL({ size: 4096, extension: 'png' });

    if (!iconUrl) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('This server does not have an icon.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} ${guild.name}'s Icon`)
      .setColor(COLORS.info)
      .setImage(iconUrl)
      .setDescription(`[Download](${iconUrl})`)
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default IconCommand;
