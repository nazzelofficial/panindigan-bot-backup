import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class HugCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'hug',
      description: 'Give someone a hug',
      category: 'fun',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['cuddle', 'snuggle'],
      examples: ['/hug @user', 'p!hug @user'],
    };
    super(options);
  }

  private hugMessages = [
    'gives a warm hug to',
    'gives a big bear hug to',
    'gives a cozy cuddle to',
    'gives a tight squeeze to',
    'gives a loving embrace to',
    'wraps their arms around',
    'gives a comforting hug to',
    'gives a sweet snuggle to',
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('user') || interaction.user;
    const message = this.hugMessages[Math.floor(Math.random() * this.hugMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 💕 Hug`)
      .setColor(COLORS.info)
      .setDescription(`${interaction.user} ${message} ${user}`)
      .setImage('https://media.giphy.com/media/od5H3PmEG5EVq/giphy.gif')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const user = message.mentions.users.first() || message.author;
    const hugMessages = this.hugMessages[Math.floor(Math.random() * this.hugMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 💕 Hug`)
      .setColor(COLORS.info)
      .setDescription(`${message.author} ${hugMessages} ${user}`)
      .setImage('https://media.giphy.com/media/od5H3PmEG5EVq/giphy.gif')
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default HugCommand;
