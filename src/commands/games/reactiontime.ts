// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class ReactionTimeCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'reactiontime',
      description: 'Test your reaction time by clicking when the emoji appears',
      category: 'games',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['reacttime'],
      examples: ['/reactiontime', 'p!reactiontime'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Reaction Time Test`)
      .setColor(COLORS.info)
      .setDescription('Wait for the 🎯 emoji to appear, then type "hit" as fast as you can!')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    const delay = Math.floor(Math.random() * 5000) + 3000;
    const startTime = Date.now() + delay;

    setTimeout(async () => {
      const goEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.games} GO!`)
        .setColor(COLORS.success)
        .setDescription('🎯 Type "hit" NOW!')
        .setTimestamp();

      await interaction.editReply({ embeds: [goEmbed] });

      const collector = interaction.channel?.createMessageCollector({
        filter: (m) => m.author.id === interaction.user.id && m.content.toLowerCase() === 'hit',
        time: 10000,
      });

      collector?.on('collect', async (m) => {
        const reactionTime = Date.now() - startTime;
        const resultEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} Reaction Time Result`)
          .setColor(COLORS.info)
          .setDescription(`Your reaction time: **${reactionTime}ms**`)
          .addFields([
            { name: 'Rating', value: this.getRating(reactionTime), inline: true },
          ])
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
    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Reaction Time Test`)
      .setColor(COLORS.info)
      .setDescription('Wait for the 🎯 emoji to appear, then type "hit" as fast as you can!')
      .setTimestamp();

    await message.reply({ embeds: [embed] });

    const delay = Math.floor(Math.random() * 5000) + 3000;
    const startTime = Date.now() + delay;

    setTimeout(async () => {
      const goEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.games} GO!`)
        .setColor(COLORS.success)
        .setDescription('🎯 Type "hit" NOW!')
        .setTimestamp();

      await message.edit({ embeds: [goEmbed] });

      const collector = message.channel.createMessageCollector({
        filter: (m) => m.author.id === message.author.id && m.content.toLowerCase() === 'hit',
        time: 10000,
      });

      collector.on('collect', async (m) => {
        const reactionTime = Date.now() - startTime;
        const resultEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} Reaction Time Result`)
          .setColor(COLORS.info)
          .setDescription(`Your reaction time: **${reactionTime}ms**`)
          .addFields([
            { name: 'Rating', value: this.getRating(reactionTime), inline: true },
          ])
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

  private getRating(time: number): string {
    if (time < 200) return '⚡ Incredible!';
    if (time < 300) return '🔥 Excellent!';
    if (time < 400) return '👍 Good';
    if (time < 500) return '😐 Average';
    return '🐢 Slow';
  }
}

export default ReactionTimeCommand;
