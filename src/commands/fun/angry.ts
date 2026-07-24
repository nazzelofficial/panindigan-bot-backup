import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class AngryCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'angry',
      description: 'Express anger',
      category: 'fun',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['mad', 'furious'],
      examples: ['/angry', 'p!angry'],
    };
    super(options);
  }

  private angryMessages = [
    'is feeling angry 😠',
    'is furious right now 😡',
    'is getting mad 😠',
    'is feeling very angry 😡',
    'is raging 😠',
    'is feeling frustrated 😡',
    'is angry and needs to vent 😠',
    'is feeling heated 😡',
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const message = this.angryMessages[Math.floor(Math.random() * this.angryMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 😠 Angry`)
      .setColor(COLORS.error)
      .setDescription(`${interaction.user} ${message}`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const angryMessage = this.angryMessages[Math.floor(Math.random() * this.angryMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 😠 Angry`)
      .setColor(COLORS.error)
      .setDescription(`${message.author} ${angryMessage}`)
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default AngryCommand;
