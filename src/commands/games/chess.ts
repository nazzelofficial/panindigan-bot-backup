import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class ChessCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'chess',
      description: 'Play chess against another user (simplified)',
      category: 'games',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['chessgame'],
      examples: ['/chess @user', 'p!chess @user'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const opponent = interaction.options.getUser('user');

    if (!opponent || opponent.id === interaction.user.id) {
      await interaction.reply({ content: '❌ Please mention another user to play against.', ephemeral: true });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Chess`)
      .setColor(COLORS.info)
      .setDescription(`${interaction.user} (White) vs ${opponent} (Black)\n\nChess is a complex game. For a full chess experience, please use a dedicated chess bot or external application. This is a placeholder for future implementation.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const opponent = message.mentions.users.first();

    if (!opponent || opponent.id === message.author.id) {
      await message.reply('❌ Please mention another user to play against.');
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Chess`)
      .setColor(COLORS.info)
      .setDescription(`${message.author} (White) vs ${opponent} (Black)\n\nChess is a complex game. For a full chess experience, please use a dedicated chess bot or external application. This is a placeholder for future implementation.`)
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default ChessCommand;
