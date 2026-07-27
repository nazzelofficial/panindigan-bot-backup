// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class HateCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'hate',
      description: 'Express hate (fun - joke command)',
      category: 'fun',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['dislike'],
      examples: ['/hate @user', 'p!hate @user'],
    };
    super(options);
  }

  private hateMessages = [
    'pretends to hate (just kidding!) 😜',
    'jokingly dislikes (love you really!) 💕',
    'fake hates (you\'re awesome!) 😊',
    'pretends to be annoyed (you\'re great!) 🤗',
    'jokingly dislikes (best friends!) 💖',
    'pretends to hate (just being silly!) 😜',
    'fake hates (you\'re amazing!) 🌟',
    'jokingly dislikes (love you!) 💕',
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('user') || interaction.user;
    const message = this.hateMessages[Math.floor(Math.random() * this.hateMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 😜 Hate (Joke)`)
      .setColor(COLORS.info)
      .setDescription(`${interaction.user} ${message} ${user}`)
      .addFields([
        { name: 'Note', value: 'This is a joke command! No actual hate intended.', inline: false },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const user = message.mentions.users.first() || message.author;
    const hateMessage = this.hateMessages[Math.floor(Math.random() * this.hateMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 😜 Hate (Joke)`)
      .setColor(COLORS.info)
      .setDescription(`${message.author} ${hateMessage} ${user}`)
      .addFields([
        { name: 'Note', value: 'This is a joke command! No actual hate intended.', inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default HateCommand;
