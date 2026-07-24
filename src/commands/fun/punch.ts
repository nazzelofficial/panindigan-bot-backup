import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class PunchCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'punch',
      description: 'Punch someone (fun action)',
      category: 'fun',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['hit'],
      examples: ['/punch @user', 'p!punch @user'],
    };
    super(options);
  }

  private punchMessages = [
    'punches',
    'gives a playful punch to',
    'punches with a boxing glove',
    'gives a gentle punch to',
    'punches affectionately',
    'gives a comical punch to',
    'punches with a foam fist',
    'gives a silly punch to',
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('user') || interaction.user;
    const message = this.punchMessages[Math.floor(Math.random() * this.punchMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 👊 Punch`)
      .setColor(COLORS.info)
      .setDescription(`${interaction.user} ${message} ${user}`)
      .setImage('https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const user = message.mentions.users.first() || message.author;
    const punchMessage = this.punchMessages[Math.floor(Math.random() * this.punchMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 👊 Punch`)
      .setColor(COLORS.info)
      .setDescription(`${message.author} ${punchMessage} ${user}`)
      .setImage('https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif')
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default PunchCommand;
