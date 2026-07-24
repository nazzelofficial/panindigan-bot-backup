import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class DonateCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'donate',
      description: 'Get information about donating to support the bot',
      category: 'info',
      cooldown: 60,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['patreon'],
      examples: ['/donate', 'p!donate'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Support the Bot`)
      .setColor(COLORS.info)
      .setDescription('Support the development of this bot by donating!')
      .addFields([
        { name: 'Patreon', value: '[Support on Patreon](https://patreon.com)', inline: true },
        { name: 'Ko-fi', value: '[Support on Ko-fi](https://ko-fi.com)', inline: true },
        { name: 'Benefits', value: 'This is a placeholder. Donation benefits will be implemented with premium integration.', inline: false },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Support the Bot`)
      .setColor(COLORS.info)
      .setDescription('Support the development of this bot by donating!')
      .addFields([
        { name: 'Patreon', value: '[Support on Patreon](https://patreon.com)', inline: true },
        { name: 'Ko-fi', value: '[Support on Ko-fi](https://ko-fi.com)', inline: true },
        { name: 'Benefits', value: 'This is a placeholder. Donation benefits will be implemented with premium integration.', inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default DonateCommand;
