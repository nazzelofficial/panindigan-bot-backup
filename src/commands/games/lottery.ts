import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class LotteryCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'lottery',
      description: 'Pick lottery numbers',
      category: 'games',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['lotto'],
      examples: ['/lottery', 'p!lottery'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const userNumbers: number[] = [];
    for (let i = 0; i < 6; i++) {
      userNumbers.push(Math.floor(Math.random() * 49) + 1);
    }
    userNumbers.sort((a, b) => a - b);

    const winningNumbers: number[] = [];
    for (let i = 0; i < 6; i++) {
      winningNumbers.push(Math.floor(Math.random() * 49) + 1);
    }
    winningNumbers.sort((a, b) => a - b);

    const matches = userNumbers.filter((num) => winningNumbers.includes(num)).length;

    let prize = '';
    switch (matches) {
      case 6:
        prize = '🏆 JACKPOT!';
        break;
      case 5:
        prize = '💰 2nd Prize!';
        break;
      case 4:
        prize = '🥉 3rd Prize!';
        break;
      case 3:
        prize = '🎁 Small Prize!';
        break;
      default:
        prize = '😢 No match';
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Lottery`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Your Numbers', value: userNumbers.join(', '), inline: true },
        { name: 'Winning Numbers', value: winningNumbers.join(', '), inline: true },
        { name: 'Matches', value: matches.toString(), inline: true },
        { name: 'Result', value: prize, inline: false },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const userNumbers: number[] = [];
    for (let i = 0; i < 6; i++) {
      userNumbers.push(Math.floor(Math.random() * 49) + 1);
    }
    userNumbers.sort((a, b) => a - b);

    const winningNumbers: number[] = [];
    for (let i = 0; i < 6; i++) {
      winningNumbers.push(Math.floor(Math.random() * 49) + 1);
    }
    winningNumbers.sort((a, b) => a - b);

    const matches = userNumbers.filter((num) => winningNumbers.includes(num)).length;

    let prize = '';
    switch (matches) {
      case 6:
        prize = '🏆 JACKPOT!';
        break;
      case 5:
        prize = '💰 2nd Prize!';
        break;
      case 4:
        prize = '🥉 3rd Prize!';
        break;
      case 3:
        prize = '🎁 Small Prize!';
        break;
      default:
        prize = '😢 No match';
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Lottery`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Your Numbers', value: userNumbers.join(', '), inline: true },
        { name: 'Winning Numbers', value: winningNumbers.join(', '), inline: true },
        { name: 'Matches', value: matches.toString(), inline: true },
        { name: 'Result', value: prize, inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default LotteryCommand;
