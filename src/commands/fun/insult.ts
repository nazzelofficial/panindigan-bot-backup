// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class InsultCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'insult',
      description: 'Insult someone (fun - joke command)',
      category: 'fun',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['diss'],
      examples: ['/insult @user', 'p!insult @user'],
    };
    super(options);
  }

  private insults = [
    'You\'re proof that evolution can go in reverse.',
    'You\'re not the dumbest person in the world, but you better hope they don\'t die.',
    'You have the charisma of a damp paper towel.',
    'You\'re like a cloud. When you disappear, it\'s a beautiful day.',
    'You\'re the human equivalent of a participation award.',
    'You\'re not ugly, you\'re just easy on the eyes... from a distance.',
    'You\'re the reason why aliens won\'t talk to us.',
    'You\'re like a software update that nobody asked for.',
    'You\'re the kind of person who loses at solitaire.',
    'You\'re not a complete idiot, some parts are missing.',
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('user') || interaction.user;
    const insult = this.insults[Math.floor(Math.random() * this.insults.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 😈 Insult (Joke)`)
      .setColor(COLORS.warning)
      .setDescription(`${user}, ${insult}`)
      .addFields([
        { name: 'Note', value: 'This is a joke command! All in good fun!', inline: false },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const user = message.mentions.users.first() || message.author;
    const insult = this.insults[Math.floor(Math.random() * this.insults.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 😈 Insult (Joke)`)
      .setColor(COLORS.warning)
      .setDescription(`${user}, ${insult}`)
      .addFields([
        { name: 'Note', value: 'This is a joke command! All in good fun!', inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default InsultCommand;
