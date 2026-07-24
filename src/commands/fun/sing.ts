import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class SingCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'sing',
      description: 'Sing a song',
      category: 'fun',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['song', 'music'],
      examples: ['/sing', 'p!sing'],
    };
    super(options);
  }

  private songs = [
    '🎵 La la la~ I\'m singing a beautiful song!',
    '🎶 Do re mi fa sol la ti do!',
    '🎤 Singing in the rain, just singing in the rain!',
    '🎵 Never gonna give you up, never gonna let you down!',
    '🎶 I will always love you~',
    '🎤 Bohemian Rhapsody is my jam!',
    '🎵 Sweet Caroline, bum bum bum~',
    '🎶 Take me home, country roads!',
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const song = this.songs[Math.floor(Math.random() * this.songs.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 🎤 Sing`)
      .setColor(COLORS.info)
      .setDescription(`${interaction.user} ${song}`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const song = this.songs[Math.floor(Math.random() * this.songs.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 🎤 Sing`)
      .setColor(COLORS.info)
      .setDescription(`${message.author} ${song}`)
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default SingCommand;
