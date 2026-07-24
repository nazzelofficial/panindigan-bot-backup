import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class BlushCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'blush',
      description: 'Blush (fun action)',
      category: 'fun',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['embarrassed'],
      examples: ['/blush', 'p!blush'],
    };
    super(options);
  }

  private blushMessages = [
    'blushes 😊',
    'blushes deeply 😳',
    'turns red 😊',
    'blushes shyly 😳',
    'face turns pink 😊',
    'blushes with embarrassment 😳',
    'cheeks turn red 😊',
    'blushes uncontrollably 😳',
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const message = this.blushMessages[Math.floor(Math.random() * this.blushMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 😊 Blush`)
      .setColor(COLORS.info)
      .setDescription(`${interaction.user} ${message}`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const blushMessage = this.blushMessages[Math.floor(Math.random() * this.blushMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 😊 Blush`)
      .setColor(COLORS.info)
      .setDescription(`${message.author} ${blushMessage}`)
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default BlushCommand;
