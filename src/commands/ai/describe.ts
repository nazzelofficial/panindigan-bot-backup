import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class DescribeCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'describe',
      description: 'Describe an image using AI',
      category: 'ai',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['imagedescription', 'vision'],
      examples: ['/describe [image attachment]', 'p!describe [image URL]'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const imageUrl = interaction.options.getString('imageurl') || '';
    const attachment = interaction.options.getAttachment('image');

    if (!imageUrl && !attachment) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide an image URL or attachment to describe.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} 👁️ AI Image Description`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Description', value: 'This is a placeholder. AI image description will be implemented with the AIHandler.', inline: false },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const imageUrl = args[0] || message.attachments.first()?.url;

    if (!imageUrl) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide an image URL or attachment to describe.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.ai} 👁️ AI Image Description`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Description', value: 'This is a placeholder. AI image description will be implemented with the AIHandler.', inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default DescribeCommand;
