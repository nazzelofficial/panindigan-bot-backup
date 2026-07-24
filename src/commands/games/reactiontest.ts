import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class ReactionTestCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'reactiontest',
      description: 'Test your reaction time',
      category: 'games',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['reaction', 'rt'],
      examples: ['/reactiontest', 'p!reactiontest'],
    };
    super(options);
  }

  private emojis = ['🎯', '⚡', '🔥', '💎', '🌟', '🎮', '🚀', '💫'];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const emoji = this.emojis[Math.floor(Math.random() * this.emojis.length)];
    const delay = Math.random() * 5000 + 2000;

    const startEmbed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Reaction Test`)
      .setColor(COLORS.info)
      .setDescription('React with 🎯 when you see the emoji!')
      .setTimestamp();

    await interaction.reply({ embeds: [startEmbed] });

    setTimeout(async () => {
      const reactionEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.games} REACT NOW!`)
        .setColor(COLORS.success)
        .setDescription(`${emoji}`)
        .setTimestamp();

      await interaction.editReply({ embeds: [reactionEmbed] });

      const startTime = Date.now();

      const collector = interaction.channel?.createMessageCollector({
        filter: (m) => m.author.id === interaction.user.id && m.content === emoji,
        time: 10000,
      });

      collector?.on('collect', async () => {
        const reactionTime = Date.now() - startTime;
        const resultEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} Reaction Time`)
          .setColor(COLORS.success)
          .setDescription(`Your reaction time: ${reactionTime}ms`)
          .setTimestamp();

        await interaction.editReply({ embeds: [resultEmbed] });
        collector.stop();
      });

      collector?.on('end', async (collected) => {
        if (collected.size === 0) {
          const timeoutEmbed = new EmbedBuilder()
            .setTitle(`${EMOJIS.error} Too Slow!`)
            .setColor(COLORS.error)
            .setDescription('You didn\'t react in time.')
            .setTimestamp();

          await interaction.editReply({ embeds: [timeoutEmbed] });
        }
      });
    }, delay);
  }

  public async executePrefix(message: Message): Promise<void> {
    const emoji = this.emojis[Math.floor(Math.random() * this.emojis.length)];
    const delay = Math.random() * 5000 + 2000;

    const startEmbed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Reaction Test`)
      .setColor(COLORS.info)
      .setDescription('React with 🎯 when you see the emoji!')
      .setTimestamp();

    await message.reply({ embeds: [startEmbed] });

    setTimeout(async () => {
      const reactionEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.games} REACT NOW!`)
        .setColor(COLORS.success)
        .setDescription(`${emoji}`)
        .setTimestamp();

      await message.edit({ embeds: [reactionEmbed] });

      const startTime = Date.now();

      const collector = message.channel.createMessageCollector({
        filter: (m) => m.author.id === message.author.id && m.content === emoji,
        time: 10000,
      });

      collector.on('collect', async () => {
        const reactionTime = Date.now() - startTime;
        const resultEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} Reaction Time`)
          .setColor(COLORS.success)
          .setDescription(`Your reaction time: ${reactionTime}ms`)
          .setTimestamp();

        await message.edit({ embeds: [resultEmbed] });
        collector.stop();
      });

      collector.on('end', async (collected) => {
        if (collected.size === 0) {
          const timeoutEmbed = new EmbedBuilder()
            .setTitle(`${EMOJIS.error} Too Slow!`)
            .setColor(COLORS.error)
            .setDescription('You didn\'t react in time.')
            .setTimestamp();

          await message.edit({ embeds: [timeoutEmbed] });
        }
      });
    }, delay);
  }
}

export default ReactionTestCommand;
