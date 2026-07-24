import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class ExcitedCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'excited',
      description: 'Express excitement',
      category: 'fun',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['hype', 'pumped'],
      examples: ['/excited', 'p!excited'],
    };
    super(options);
  }

  private excitedMessages = [
    'is super excited! 🎉',
    'is hyped up! 🤩',
    'can\'t contain their excitement! 🎊',
    'is bursting with excitement! ✨',
    'is feeling pumped! 🤩',
    'is so excited right now! 🎉',
    'is full of energy and excitement! 🎊',
    'is ready for anything! 🤩',
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const message = this.excitedMessages[Math.floor(Math.random() * this.excitedMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 🤩 Excited`)
      .setColor(COLORS.success)
      .setDescription(`${interaction.user} ${message}`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const excitedMessage = this.excitedMessages[Math.floor(Math.random() * this.excitedMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 🤩 Excited`)
      .setColor(COLORS.success)
      .setDescription(`${message.author} ${excitedMessage}`)
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default ExcitedCommand;
