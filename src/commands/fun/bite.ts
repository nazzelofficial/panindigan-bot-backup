import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class BiteCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'bite',
      description: 'Bite someone (fun action)',
      category: 'fun',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['chomp'],
      examples: ['/bite @user', 'p!bite @user'],
    };
    super(options);
  }

  private biteMessages = [
    'bites',
    'gives a playful bite to',
    'nibbles on',
    'gives a gentle bite to',
    'bites affectionately',
    'gives a nibble to',
    'bites like a vampire',
    'gives a cute bite to',
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('user') || interaction.user;
    const message = this.biteMessages[Math.floor(Math.random() * this.biteMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 🦷 Bite`)
      .setColor(COLORS.info)
      .setDescription(`${interaction.user} ${message} ${user}`)
      .setImage('https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const user = message.mentions.users.first() || message.author;
    const biteMessage = this.biteMessages[Math.floor(Math.random() * this.biteMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 🦷 Bite`)
      .setColor(COLORS.info)
      .setDescription(`${message.author} ${biteMessage} ${user}`)
      .setImage('https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif')
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default BiteCommand;
