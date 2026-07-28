// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class BonkCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'funbonk',
      description: 'Bonk someone (fun action)',
      category: 'fun',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['bap'],
      examples: ['/bonk @user', 'p!bonk @user'],
    };
    super(options);
  }

  private bonkMessages = [
    'bonks',
    'gives a bonk to',
    'bonks with a bat',
    'gives a gentle bonk to',
    'bonks affectionately',
    'gives a comical bonk to',
    'bonks with a foam bat',
    'gives a silly bonk to',
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('user') || interaction.user;
    const message = this.bonkMessages[Math.floor(Math.random() * this.bonkMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 🦴 Bonk`)
      .setColor(COLORS.info)
      .setDescription(`${interaction.user} ${message} ${user}`)
      .setImage('https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const user = message.mentions.users.first() || message.author;
    const bonkMessage = this.bonkMessages[Math.floor(Math.random() * this.bonkMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 🦴 Bonk`)
      .setColor(COLORS.info)
      .setDescription(`${message.author} ${bonkMessage} ${user}`)
      .setImage('https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif')
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default BonkCommand;
