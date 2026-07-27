// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class DareCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'dare',
      description: 'Get a random dare challenge',
      category: 'fun',
      premiumTier: 'bronze',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      ownerOnly: false,
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['challenge'],
      examples: ['/dare', 'p!dare'],
    };
    super(options);
  }

  private dares = [
    'Do your best impression of a celebrity for 1 minute.',
    'Send the last photo in your camera roll to someone in the group.',
    'Speak in an accent for the next 3 rounds.',
    'Text your crush or a random contact "I know what you did."',
    'Do 20 jumping jacks right now.',
    'Share the most recent text you sent without context.',
    'Eat a spoonful of hot sauce.',
    'Call a family member and sing them happy birthday (even if it\'s not their birthday).',
    'Let someone post something on your social media.',
    'Do your best animal impression.',
    'Wear your clothes inside out for the next 10 minutes.',
    'Talk like a robot for the next 2 rounds.',
    'Do the worm dance move.',
    'Let someone draw on your face with a marker.',
    'Speak only in questions for the next 5 minutes.',
    'Do your best celebrity impression.',
    'Make up a short rap about the person to your left.',
    'Let someone style your hair however they want.',
    'Do a cartwheel or attempt to do one.',
    'Talk in slow motion for the next 3 minutes.',
    'Say the alphabet backwards as fast as you can.',
    'Eat something you dislike without making a face.',
    'Do 10 push-ups right now.',
    'Let the group go through your phone for 30 seconds.',
    'Speak in rhymes for the next 2 rounds.',
    'Do your best runway model walk.',
    'Give a dramatic reading of the last text message you received.',
    'Post an embarrassing childhood photo on your social media.',
    'Talk without closing your mouth fully for 2 minutes.',
    'Attempt to lick your elbow.',
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const dare = this.dares[Math.floor(Math.random() * this.dares.length)];

    const embed = new EmbedBuilder()
      .setTitle('😈 Dare Challenge')
      .setDescription(`**${dare}**`)
      .setColor(COLORS.error)
      .setFooter({ text: 'Do you dare to complete this challenge?' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const dare = this.dares[Math.floor(Math.random() * this.dares.length)];

    const embed = new EmbedBuilder()
      .setTitle('😈 Dare Challenge')
      .setDescription(`**${dare}**`)
      .setColor(COLORS.error)
      .setFooter({ text: 'Do you dare to complete this challenge?' })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default DareCommand;
