import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class TruthCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'truth',
      description: 'Get a random truth question',
      category: 'fun',
      premiumTier: 'bronze',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      ownerOnly: false,
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['truthquestion'],
      examples: ['/truth', 'p!truth'],
    };
    super(options);
  }

  private truths = [
    'What is the most embarrassing thing you have ever done?',
    'Have you ever lied to get out of trouble? What was the lie?',
    'What is your biggest fear?',
    'Have you ever cheated on a test?',
    'What is the worst gift you have ever received?',
    'Have you ever spread a rumor about someone?',
    'What is your most embarrassing childhood memory?',
    'Have you ever pretended to be sick to skip school or work?',
    'What is the weirdest dream you have ever had?',
    'Have you ever stolen something?',
    'What is the most childish thing you still do?',
    'Have you ever blamed someone else for something you did?',
    'What is your biggest regret?',
    'Have you ever stood someone up?',
    'What is something you have never told your parents?',
    'Have you ever been caught doing something embarrassing?',
    'What is the most ridiculous thing you believed as a child?',
    'Have you ever read someone else\'s messages without them knowing?',
    'What is the worst thing you have ever said to someone you love?',
    'Have you ever ghosted someone?',
    'What is your biggest insecurity?',
    'Have you ever laughed at an inappropriate time?',
    'What is the strangest thing you have eaten on a dare?',
    'Have you ever pretended to like someone\'s gift?',
    'What is the most embarrassing thing in your search history?',
    'Have you ever fallen asleep somewhere you shouldn\'t have?',
    'What is something you would be embarrassed if your family knew?',
    'Have you ever told a lie and stuck with it for years?',
    'What is the most trouble you have ever been in?',
    'Have you ever done something embarrassing in public?',
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const truth = this.truths[Math.floor(Math.random() * this.truths.length)];

    const embed = new EmbedBuilder()
      .setTitle('🤔 Truth Question')
      .setDescription(`**${truth}**`)
      .setColor(COLORS.info)
      .setFooter({ text: 'You must answer honestly!' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const truth = this.truths[Math.floor(Math.random() * this.truths.length)];

    const embed = new EmbedBuilder()
      .setTitle('🤔 Truth Question')
      .setDescription(`**${truth}**`)
      .setColor(COLORS.info)
      .setFooter({ text: 'You must answer honestly!' })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default TruthCommand;
