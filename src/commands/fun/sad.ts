// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class SadCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'sad',
      description: 'Express sadness',
      category: 'fun',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['unhappy', 'depressed'],
      examples: ['/sad', 'p!sad'],
    };
    super(options);
  }

  private sadMessages = [
    'is feeling a bit sad today 😢',
    'is feeling down 😔',
    'is not having the best day 😢',
    'is feeling lonely 😔',
    'is feeling sad and needs a hug 😢',
    'is having a rough time 😔',
    'is feeling emotional 😢',
    'is feeling blue today 😔',
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const message = this.sadMessages[Math.floor(Math.random() * this.sadMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 😢 Sad`)
      .setColor(COLORS.warning)
      .setDescription(`${interaction.user} ${message}`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const sadMessage = this.sadMessages[Math.floor(Math.random() * this.sadMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 😢 Sad`)
      .setColor(COLORS.warning)
      .setDescription(`${message.author} ${sadMessage}`)
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default SadCommand;
