import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class UnoCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'uno',
      description: 'Play UNO against another user (simplified)',
      category: 'games',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['unogame'],
      examples: ['/uno @user', 'p!uno @user'],
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
      .setTitle(`${EMOJIS.games} UNO`)
      .setColor(COLORS.info)
      .setDescription(`${interaction.user} vs ${opponent}\n\nUNO is a complex card game. For a full UNO experience, please use a dedicated UNO bot or external application. This is a placeholder for future implementation.`)
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
      .setTitle(`${EMOJIS.games} UNO`)
      .setColor(COLORS.info)
      .setDescription(`${message.author} vs ${opponent}\n\nUNO is a complex card game. For a full UNO experience, please use a dedicated UNO bot or external application. This is a placeholder for future implementation.`)
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default UnoCommand;
