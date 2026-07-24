import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class JokeCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'joke',
      description: 'Get a random joke',
      category: 'fun',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['jokes', 'funny'],
      examples: ['/joke', 'p!joke'],
    };
    super(options);
  }

  private jokes = [
    { setup: 'Why don\'t scientists trust atoms?', punchline: 'Because they make up everything!' },
    { setup: 'Why did the scarecrow win an award?', punchline: 'Because he was outstanding in his field!' },
    { setup: 'Why don\'t eggs tell jokes?', punchline: 'They\'d crack each other up!' },
    { setup: 'What do you call a fake noodle?', punchline: 'An impasta!' },
    { setup: 'Why did the bicycle fall over?', punchline: 'Because it was two-tired!' },
    { setup: 'What do you call a bear with no teeth?', punchline: 'A gummy bear!' },
    { setup: 'Why can\'t you give Elsa a balloon?', punchline: 'Because she will let it go!' },
    { setup: 'What do you call a fish without eyes?', punchline: 'A fsh!' },
    { setup: 'Why did the math book look so sad?', punchline: 'Because it had too many problems!' },
    { setup: 'What do you call a dinosaur that crashes their car?', punchline: 'Tyrannosaurus Wrecks!' },
    { setup: 'Why don\'t skeletons fight each other?', punchline: 'They don\'t have the guts!' },
    { setup: 'What do you call a lazy kangaroo?', punchline: 'A pouch potato!' },
    { setup: 'Why did the coffee file a police report?', punchline: 'It got mugged!' },
    { setup: 'What do you call a can opener that doesn\'t work?', punchline: 'A can\'t opener!' },
    { setup: 'Why did the golfer bring two pairs of pants?', punchline: 'In case he got a hole in one!' },
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const joke = this.jokes[Math.floor(Math.random() * this.jokes.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} Random Joke`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Setup', value: joke.setup, inline: false },
        { name: 'Punchline', value: joke.punchline, inline: false },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const joke = this.jokes[Math.floor(Math.random() * this.jokes.length)];

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} Random Joke`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Setup', value: joke.setup, inline: false },
        { name: 'Punchline', value: joke.punchline, inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default JokeCommand;
