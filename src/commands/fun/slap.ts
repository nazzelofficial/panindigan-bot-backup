import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class SlapCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'slap',
      description: 'Slap someone (fun action)',
      category: 'fun',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['hit', 'smack'],
      examples: ['/slap @user', 'p!slap @user'],
    };
    super(options);
  }

  private slapMessages = [
    'slaps',
    'gives a playful slap to',
    'slaps with a trout',
    'delivers a comical slap to',
    'slaps with a wet noodle',
    'gives a gentle slap to',
    'slaps with a rubber chicken',
    'delivers a dramatic slap to',
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('user') || interaction.user;
    const message = this.slapMessages[Math.floor(Math.random() * this.slapMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 👋 Slap`)
      .setColor(COLORS.info)
      .setDescription(`${interaction.user} ${message} ${user}`)
      .setImage('https://media.giphy.com/media/3o6Zt481isZDuw/giphy.gif')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const user = message.mentions.users.first() || message.author;
    const slapMessage = this.slapMessages[Math.floor(Math.random() * this.slapMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 👋 Slap`)
      .setColor(COLORS.info)
      .setDescription(`${message.author} ${slapMessage} ${user}`)
      .setImage('https://media.giphy.com/media/3o6Zt481isZDuw/giphy.gif')
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default SlapCommand;
