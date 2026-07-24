import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class ReactionGameCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'reactiongame',
      description: 'React to the correct emoji',
      category: 'games',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['reaction'],
      examples: ['/reactiongame', 'p!reactiongame'],
    };
    super(options);
  }

  private emojis = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍒', '🥝', '🍑'];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const targetEmoji = this.emojis[Math.floor(Math.random() * this.emojis.length)];
    const randomEmojis = this.emojis.filter((e) => e !== targetEmoji).sort(() => Math.random() - 0.5).slice(0, 3);
    const allEmojis = [targetEmoji, ...randomEmojis].sort(() => Math.random() - 0.5);

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Reaction Game`)
      .setColor(COLORS.info)
      .setDescription(`React with: ${targetEmoji}\n\nOptions: ${allEmojis.join(' ')}`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    const collector = interaction.channel?.createMessageCollector({
      filter: (m) => m.author.id === interaction.user.id,
      time: 10000,
    });

    collector?.on('collect', async (m) => {
      if (m.content === targetEmoji) {
        const winEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} You Won!`)
          .setColor(COLORS.success)
          .setDescription(`You reacted correctly with ${targetEmoji}!`)
          .setTimestamp();

        await interaction.editReply({ embeds: [winEmbed] });
        collector.stop();
      } else {
        await m.reply('Wrong emoji! Try again.');
      }
    });

    collector?.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Time's Up!`)
          .setColor(COLORS.error)
          .setDescription(`The correct emoji was ${targetEmoji}.`)
          .setTimestamp();

        await interaction.editReply({ embeds: [timeoutEmbed] });
      }
    });
  }

  public async executePrefix(message: Message): Promise<void> {
    const targetEmoji = this.emojis[Math.floor(Math.random() * this.emojis.length)];
    const randomEmojis = this.emojis.filter((e) => e !== targetEmoji).sort(() => Math.random() - 0.5).slice(0, 3);
    const allEmojis = [targetEmoji, ...randomEmojis].sort(() => Math.random() - 0.5);

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Reaction Game`)
      .setColor(COLORS.info)
      .setDescription(`React with: ${targetEmoji}\n\nOptions: ${allEmojis.join(' ')}`)
      .setTimestamp();

    await message.reply({ embeds: [embed] });

    const collector = message.channel.createMessageCollector({
      filter: (m) => m.author.id === message.author.id,
      time: 10000,
    });

    collector.on('collect', async (m) => {
      if (m.content === targetEmoji) {
        const winEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} You Won!`)
          .setColor(COLORS.success)
          .setDescription(`You reacted correctly with ${targetEmoji}!`)
          .setTimestamp();

        await message.edit({ embeds: [winEmbed] });
        collector.stop();
      } else {
        await m.reply('Wrong emoji! Try again.');
      }
    });

    collector.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Time's Up!`)
          .setColor(COLORS.error)
          .setDescription(`The correct emoji was ${targetEmoji}.`)
          .setTimestamp();

        await message.edit({ embeds: [timeoutEmbed] });
      }
    });
  }
}

export default ReactionGameCommand;
