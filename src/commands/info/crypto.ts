import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class CryptoCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'crypto',
      description: 'Get cryptocurrency price information',
      category: 'info',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: [],
      examples: ['/crypto bitcoin', '/crypto BTC', 'p!crypto ethereum'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const crypto = interaction.options.getString('crypto') || 'bitcoin';
    const cryptoUpper = crypto.toUpperCase();

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 💰 Cryptocurrency: ${cryptoUpper}`)
      .setColor(COLORS.info)
      .setDescription('This is a placeholder. Crypto prices will be implemented with a cryptocurrency API.')
      .addFields([
        { name: 'Symbol', value: cryptoUpper, inline: true },
        { name: 'Price (USD)', value: 'N/A', inline: true },
        { name: '24h Change', value: 'N/A', inline: true },
        { name: 'Market Cap', value: 'N/A', inline: true },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const crypto = args[0] || 'bitcoin';
    const cryptoUpper = crypto.toUpperCase();

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 💰 Cryptocurrency: ${cryptoUpper}`)
      .setColor(COLORS.info)
      .setDescription('This is a placeholder. Crypto prices will be implemented with a cryptocurrency API.')
      .addFields([
        { name: 'Symbol', value: cryptoUpper, inline: true },
        { name: 'Price (USD)', value: 'N/A', inline: true },
        { name: '24h Change', value: 'N/A', inline: true },
        { name: 'Market Cap', value: 'N/A', inline: true },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default CryptoCommand;
