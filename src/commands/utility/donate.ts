import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class DonateCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'donate',
      description: 'Get donation information',
      category: 'utility',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: [],
      examples: ['/donate', 'p!donate'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 💖 Donate to Panindigan`)
      .setColor(COLORS.info)
      .setDescription('Support the development of Panindigan!')
      .addFields([
        { name: 'Patreon', value: '[Support here](https://patreon.com)', inline: true },
        { name: 'Ko-fi', value: '[Support here](https://ko-fi.com)', inline: true },
        { name: 'PayPal', value: '[Donate here](https://paypal.com)', inline: true },
      ])
      .setFooter({ text: 'Every donation helps!' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 💖 Donate to Panindigan`)
      .setColor(COLORS.info)
      .setDescription('Support the development of Panindigan!')
      .addFields([
        { name: 'Patreon', value: '[Support here](https://patreon.com)', inline: true },
        { name: 'Ko-fi', value: '[Support here](https://ko-fi.com)', inline: true },
        { name: 'PayPal', value: '[Donate here](https://paypal.com)', inline: true },
      ])
      .setFooter({ text: 'Every donation helps!' })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default DonateCommand;
