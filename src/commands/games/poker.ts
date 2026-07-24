import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class PokerCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'poker',
      description: 'Play poker (simplified)',
      category: 'games',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['texasholdem', 'holdem'],
      examples: ['/poker', 'p!poker'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Poker`)
      .setColor(COLORS.info)
      .setDescription('Poker is a complex game with many variants. For a full poker experience, please use a dedicated poker bot or external application. This is a placeholder for future implementation.')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Poker`)
      .setColor(COLORS.info)
      .setDescription('Poker is a complex game with many variants. For a full poker experience, please use a dedicated poker bot or external application. This is a placeholder for future implementation')
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default PokerCommand;
