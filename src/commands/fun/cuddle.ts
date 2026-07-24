import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class CuddleCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'cuddle',
      description: 'Cuddle with someone',
      category: 'fun',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['snuggle', 'snugs'],
      examples: ['/cuddle @user', 'p!cuddle @user'],
    };
    super(options);
  }

  private cuddleMessages = [
    'cuddles with',
    'gives a warm cuddle to',
    'snuggles up with',
    'gives a cozy cuddle to',
    'cuddles affectionately with',
    'gives a loving cuddle to',
    'snuggles close to',
    'gives a sweet cuddle to',
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('user') || interaction.user;
    const message = this.cuddleMessages[Math.floor(Math.random() * this.cuddleMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 🤗 Cuddle`)
      .setColor(COLORS.info)
      .setDescription(`${interaction.user} ${message} ${user}`)
      .setImage('https://media.giphy.com/media/od5H3PmEG5EVq/giphy.gif')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const user = message.mentions.users.first() || message.author;
    const cuddleMessage = this.cuddleMessages[Math.floor(Math.random() * this.cuddleMessages.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 🤗 Cuddle`)
      .setColor(COLORS.info)
      .setDescription(`${message.author} ${cuddleMessage} ${user}`)
      .setImage('https://media.giphy.com/media/od5H3PmEG5EVq/giphy.gif')
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default CuddleCommand;
