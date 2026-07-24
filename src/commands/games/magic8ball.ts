import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class Magic8BallCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'magic8ball',
      description: 'Ask the magic 8-ball a question',
      category: 'games',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['8ball', 'magicball'],
      examples: ['/magic8ball Will I win?', 'p!magic8ball Will I win?'],
    };
    super(options);
  }

  private responses = [
    'It is certain.',
    'It is decidedly so.',
    'Without a doubt.',
    'Yes, definitely.',
    'You may rely on it.',
    'As I see it, yes.',
    'Most likely.',
    'Outlook good.',
    'Yes.',
    'Signs point to yes.',
    'Reply hazy, try again.',
    'Ask again later.',
    'Better not tell you now.',
    'Cannot predict now.',
    'Concentrate and ask again.',
    'Don\'t count on it.',
    'My reply is no.',
    'My sources say no.',
    'Outlook not so good.',
    'Very doubtful.',
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const question = interaction.options.getString('question');
    const response = this.responses[Math.floor(Math.random() * this.responses.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Magic 8-Ball`)
      .setColor(COLORS.info)
      .setDescription(`${question ? `**Question:** ${question}\n\n` : ''}🎱 **Answer:** ${response}`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const question = args.join(' ');
    const response = this.responses[Math.floor(Math.random() * this.responses.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Magic 8-Ball`)
      .setColor(COLORS.info)
      .setDescription(`${question ? `**Question:** ${question}\n\n` : ''}🎱 **Answer:** ${response}`)
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default Magic8BallCommand;
