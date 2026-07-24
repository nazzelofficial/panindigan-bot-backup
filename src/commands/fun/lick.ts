import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class LickCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'lick',
      description: 'Lick someone (fun action)',
      category: 'fun',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['slobber'],
      examples: ['/lick @user', 'p!lick @user'],
    };
    super(options);
  }

  private lickMessages = [
    'licks',
    'gives a lick to',
    'licks playfully',
    'gives a silly lick to',
    'licks like a dog',
    'gives a wet lick to',
    'licks affectionately',
    'gives a goofy lick to',
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('user') || interaction.user;
    const message = this.lickMessages[Math.floor(Math.random() * this.lickMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 😛 Lick`)
      .setColor(COLORS.info)
      .setDescription(`${interaction.user} ${message} ${user}`)
      .setImage('https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const user = message.mentions.users.first() || message.author;
    const lickMessage = this.lickMessages[Math.floor(Math.random() * this.lickMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 😛 Lick`)
      .setColor(COLORS.info)
      .setDescription(`${message.author} ${lickMessage} ${user}`)
      .setImage('https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif')
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default LickCommand;
