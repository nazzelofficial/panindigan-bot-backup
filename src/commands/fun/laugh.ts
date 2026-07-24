import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class LaughCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'laugh',
      description: 'Laugh (fun action)',
      category: 'fun',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['lol', 'lmao'],
      examples: ['/laugh', 'p!laugh'],
    };
    super(options);
  }

  private laughMessages = [
    'laughs 😂',
    'laughs out loud 😂',
    'cracks up laughing 😆',
    'laughs hysterically 🤣',
    'giggles 😂',
    'laughs uncontrollably 🤣',
    'snorts with laughter 😆',
    'bursts out laughing 😂',
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const message = this.laughMessages[Math.floor(Math.random() * this.laughMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 😂 Laugh`)
      .setColor(COLORS.info)
      .setDescription(`${interaction.user} ${message}`)
      .setImage('https://media.giphy.com/media/1HQIBIh8z4J6g/giphy.gif')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const laughMessage = this.laughMessages[Math.floor(Math.random() * this.laughMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 😂 Laugh`)
      .setColor(COLORS.info)
      .setDescription(`${message.author} ${laughMessage}`)
      .setImage('https://media.giphy.com/media/1HQIBIh8z4J6g/giphy.gif')
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default LaughCommand;
