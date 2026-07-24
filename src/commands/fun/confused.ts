import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class ConfusedCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'confused',
      description: 'Express confusion',
      category: 'fun',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['huh', 'what'],
      examples: ['/confused', 'p!confused'],
    };
    super(options);
  }

  private confusedMessages = [
    'is confused 😕',
    'doesn\'t understand what\'s happening 🤔',
    'is feeling confused 😕',
    'is scratching their head in confusion 🤔',
    'is puzzled 😕',
    'is trying to figure things out 🤔',
    'is completely confused 😕',
    'is wondering what\'s going on 🤔',
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const message = this.confusedMessages[Math.floor(Math.random() * this.confusedMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 🤔 Confused`)
      .setColor(COLORS.warning)
      .setDescription(`${interaction.user} ${message}`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const confusedMessage = this.confusedMessages[Math.floor(Math.random() * this.confusedMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 🤔 Confused`)
      .setColor(COLORS.warning)
      .setDescription(`${message.author} ${confusedMessage}`)
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default ConfusedCommand;
