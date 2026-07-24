import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class SpeedTestCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'speedtest',
      description: 'Test your reaction speed',
      category: 'games',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['reaction', 'reflex'],
      examples: ['/speedtest', 'p!speedtest'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Speed Test`)
      .setColor(COLORS.info)
      .setDescription('Wait for the 🎯 emoji to appear, then react as fast as you can!')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    const delay = Math.floor(Math.random() * 5000) + 3000;
    const startTime = Date.now() + delay;

    setTimeout(async () => {
      const updateEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.games} GO!`)
        .setColor(COLORS.success)
        .setDescription('🎯 REACT NOW!')
        .setTimestamp();

      await interaction.editReply({ embeds: [updateEmbed] });

      const collector = interaction.channel?.createMessageCollector({
        filter: (m) => m.author.id === interaction.user.id,
        time: 10000,
      });

      collector?.on('collect', async (m) => {
        const reactionTime = Date.now() - startTime;
        const resultEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} Speed Test Result`)
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
      .setTitle(`${EMOJIS.games} Speed Test`)
      .setColor(COLORS.info)
      .setDescription('Wait for the 🎯 emoji to appear, then react as fast as you can!')
      .setTimestamp();

    await message.reply({ embeds: [embed] });

    const delay = Math.floor(Math.random() * 5000) + 3000;
    const startTime = Date.now() + delay;

    setTimeout(async () => {
      const updateEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.games} GO!`)
        .setColor(COLORS.success)
        .setDescription('🎯 REACT NOW!')
        .setTimestamp();

      await message.edit({ embeds: [updateEmbed] });

      const collector = message.channel.createMessageCollector({
        filter: (m) => m.author.id === message.author.id,
        time: 10000,
      });

      collector.on('collect', async (m) => {
        const reactionTime = Date.now() - startTime;
        const resultEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} Speed Test Result`)
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

export default SpeedTestCommand;
