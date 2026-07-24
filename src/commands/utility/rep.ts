import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class RepCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'rep',
      description: 'Give reputation to a user',
      category: 'utility',
      cooldown: 3600,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['reputation'],
      examples: ['/rep @user', 'p!rep @user'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('user');

    if (!user) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a user to give reputation to.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    if (user.id === interaction.user.id) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('You cannot give reputation to yourself.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Reputation Given`)
      .setColor(COLORS.info)
      .setDescription(`This is a placeholder. Reputation will be implemented with database integration.`)
      .addFields([
        { name: 'Recipient', value: user.username, inline: true },
        { name: 'Status', value: 'Database integration pending', inline: false },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const user = message.mentions.users.first();

    if (!user) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a user to give reputation to.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    if (user.id === message.author.id) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('You cannot give reputation to yourself.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Reputation Given`)
      .setColor(COLORS.info)
      .setDescription(`This is a placeholder. Reputation will be implemented with database integration.`)
      .addFields([
        { name: 'Recipient', value: user.username, inline: true },
        { name: 'Status', value: 'Database integration pending', inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default RepCommand;
