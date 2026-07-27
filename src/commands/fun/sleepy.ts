// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class SleepyCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'sleepy',
      description: 'Express sleepiness',
      category: 'fun',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['tired', 'exhausted'],
      examples: ['/sleepy', 'p!sleepy'],
    };
    super(options);
  }

  private sleepyMessages = [
    'is feeling very sleepy 😴',
    'is ready for a nap 😴',
    'is exhausted and needs sleep 😪',
    'is dozing off 😴',
    'is feeling tired 😪',
    'is barely keeping eyes open 😴',
    'is ready to hit the hay 😪',
    'is feeling drowsy 😴',
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const message = this.sleepyMessages[Math.floor(Math.random() * this.sleepyMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 😴 Sleepy`)
      .setColor(COLORS.info)
      .setDescription(`${interaction.user} ${message}`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const sleepyMessage = this.sleepyMessages[Math.floor(Math.random() * this.sleepyMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 😴 Sleepy`)
      .setColor(COLORS.info)
      .setDescription(`${message.author} ${sleepyMessage}`)
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default SleepyCommand;
