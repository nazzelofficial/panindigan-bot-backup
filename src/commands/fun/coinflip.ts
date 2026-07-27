// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class CoinFlipCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'coinflip',
      description: 'Flip a coin',
      category: 'fun',
      cooldown: 3,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['flip', 'coin'],
      examples: ['/coinflip', 'p!coinflip'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
    const emoji = result === 'Heads' ? '🪙' : '🪙';

    const embed = new EmbedBuilder()
      .setTitle(`${emoji} Coin Flip`)
      .setColor(COLORS.info)
      .setDescription(`The coin landed on: **${result}**`)
      .addFields([
        { name: 'Result', value: result, inline: true },
        { name: 'Chance', value: '50/50', inline: true },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
    const emoji = result === 'Heads' ? '🪙' : '🪙';

    const embed = new EmbedBuilder()
      .setTitle(`${emoji} Coin Flip`)
      .setColor(COLORS.info)
      .setDescription(`The coin landed on: **${result}**`)
      .addFields([
        { name: 'Result', value: result, inline: true },
        { name: 'Chance', value: '50/50', inline: true },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default CoinFlipCommand;
