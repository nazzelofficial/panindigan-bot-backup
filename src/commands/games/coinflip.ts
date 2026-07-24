import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class CoinFlipCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'coinflip',
      description: 'Flip a coin',
      category: 'games',
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
    const choice = interaction.options.getString('choice');
    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    const emoji = result === 'heads' ? '🪙' : '🪙';

    let description = `The coin landed on **${result.toUpperCase()}**! ${emoji}`;

    if (choice && ['heads', 'tails'].includes(choice.toLowerCase())) {
      const won = choice.toLowerCase() === result;
      description = won
        ? `The coin landed on **${result.toUpperCase()}**! ${emoji}\n\n🎉 You won!`
        : `The coin landed on **${result.toUpperCase()}**! ${emoji}\n\n😢 You lost!`;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Coin Flip`)
      .setColor(COLORS.info)
      .setDescription(description)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const choice = args[0]?.toLowerCase();
    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    const emoji = result === 'heads' ? '🪙' : '🪙';

    let description = `The coin landed on **${result.toUpperCase()}**! ${emoji}`;

    if (choice && ['heads', 'tails'].includes(choice)) {
      const won = choice === result;
      description = won
        ? `The coin landed on **${result.toUpperCase()}**! ${emoji}\n\n🎉 You won!`
        : `The coin landed on **${result.toUpperCase()}**! ${emoji}\n\n😢 You lost!`;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Coin Flip`)
      .setColor(COLORS.info)
      .setDescription(description)
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default CoinFlipCommand;
