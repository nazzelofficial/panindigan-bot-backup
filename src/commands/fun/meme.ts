import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class MemeCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'meme',
      description: 'Get a random meme',
      category: 'fun',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['memes', 'dankmeme'],
      examples: ['/meme', 'p!meme'],
    };
    super(options);
  }

  private memeTemplates = [
    { template: 'When the code works on the first try', emoji: '😱' },
    { template: 'Me explaining to my mom why I\'m still single', emoji: '😂' },
    { template: 'When you forget to save your work', emoji: '💀' },
    { template: 'Friday feeling', emoji: '🎉' },
    { template: 'Monday morning', emoji: '😴' },
    { template: 'When the WiFi disconnects', emoji: '😡' },
    { template: 'Trying to understand someone else\'s code', emoji: '🤯' },
    { template: 'When the deadline is tomorrow', emoji: '😰' },
    { template: 'After 8 hours of debugging', emoji: '🧠' },
    { template: 'When you finally fix the bug', emoji: '🎊' },
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const meme = this.memeTemplates[Math.floor(Math.random() * this.memeTemplates.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} Random Meme`)
      .setColor(COLORS.info)
      .setDescription(`${meme.emoji} ${meme.template}`)
      .setImage('https://i.imgflip.com/1g8my4.jpg')
      .setFooter({ text: 'Meme template - add your own caption!' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const meme = this.memeTemplates[Math.floor(Math.random() * this.memeTemplates.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} Random Meme`)
      .setColor(COLORS.info)
      .setDescription(`${meme.emoji} ${meme.template}`)
      .setImage('https://i.imgflip.com/1g8my4.jpg')
      .setFooter({ text: 'Meme template - add your own caption!' })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default MemeCommand;
