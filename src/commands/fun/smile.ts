import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class SmileCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'smile',
      description: 'Smile at someone',
      category: 'fun',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['grin'],
      examples: ['/smile @user', 'p!smile @user'],
    };
    super(options);
  }

  private smileMessages = [
    'smiles at',
    'gives a warm smile to',
    'smiles brightly at',
    'gives a friendly smile to',
    'smiles happily at',
    'gives a cheerful smile to',
    'smiles with joy at',
    'gives a sweet smile to',
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('user') || interaction.user;
    const message = this.smileMessages[Math.floor(Math.random() * this.smileMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 😊 Smile`)
      .setColor(COLORS.info)
      .setDescription(`${interaction.user} ${message} ${user}`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const user = message.mentions.users.first() || message.author;
    const smileMessage = this.smileMessages[Math.floor(Math.random() * this.smileMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 😊 Smile`)
      .setColor(COLORS.info)
      .setDescription(`${message.author} ${smileMessage} ${user}`)
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default SmileCommand;
