// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class CatchGameCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'catchgame',
      description: 'Catch the falling object game',
      category: 'games',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['catch'],
      examples: ['/catchgame', 'p!catchgame'],
    };
    super(options);
  }

  private objects = ['🍎', '🍌', '🍊', '🍇', '⭐', '💎', '🎁'];
  private score = 0;
  private maxRounds = 10;
  private currentRound = 0;

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    this.score = 0;
    this.currentRound = 0;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Catch Game`)
      .setColor(COLORS.info)
      .setDescription(`Type the object you see to catch it!\n\nScore: ${this.score}/${this.maxRounds}`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    const collector = interaction.channel?.createMessageCollector({
      filter: (m) => m.author.id === interaction.user.id,
      time: 60000,
    });

    const showObject = async () => {
      if (this.currentRound >= this.maxRounds) {
        const finalEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} Game Over`)
          .setColor(COLORS.info)
          .setDescription(`Final Score: ${this.score}/${this.maxRounds}`)
          .setTimestamp();

        await interaction.editReply({ embeds: [finalEmbed] });
        collector?.stop();
        return;
      }

      const object = this.objects[Math.floor(Math.random() * this.objects.length)];
      const updateEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.games} Catch Game`)
        .setColor(COLORS.info)
        .setDescription(`Type this object: ${object}\n\nScore: ${this.score}/${this.maxRounds}`)
        .setTimestamp();

      await interaction.editReply({ embeds: [updateEmbed] });
      this.currentRound++;
    };

    showObject();

    collector?.on('collect', async (m) => {
      const currentEmbed = (await interaction.fetchReply()).embeds[0];
      const description = currentEmbed.description || '';
      const match = description.match(/Type this object: (.+)/);
      
      if (match && m.content === match[1]) {
        this.score++;
        showObject();
      } else {
        await m.reply('Wrong object! Try again.');
      }
    });

    collector?.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Time's Up!`)
          .setColor(COLORS.error)
          .setDescription(`Final Score: ${this.score}/${this.maxRounds}`)
          .setTimestamp();

        await interaction.editReply({ embeds: [timeoutEmbed] });
      }
    });
  }

  public async executePrefix(message: Message): Promise<void> {
    this.score = 0;
    this.currentRound = 0;

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.games} Catch Game`)
      .setColor(COLORS.info)
      .setDescription(`Type the object you see to catch it!\n\nScore: ${this.score}/${this.maxRounds}`)
      .setTimestamp();

    await message.reply({ embeds: [embed] });

    const collector = message.channel.createMessageCollector({
      filter: (m) => m.author.id === message.author.id,
      time: 60000,
    });

    const showObject = async () => {
      if (this.currentRound >= this.maxRounds) {
        const finalEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.games} Game Over`)
          .setColor(COLORS.info)
          .setDescription(`Final Score: ${this.score}/${this.maxRounds}`)
          .setTimestamp();

        await message.edit({ embeds: [finalEmbed] });
        collector.stop();
        return;
      }

      const object = this.objects[Math.floor(Math.random() * this.objects.length)];
      const updateEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.games} Catch Game`)
        .setColor(COLORS.info)
        .setDescription(`Type this object: ${object}\n\nScore: ${this.score}/${this.maxRounds}`)
        .setTimestamp();

      await message.edit({ embeds: [updateEmbed] });
      this.currentRound++;
    };

    showObject();

    collector.on('collect', async (m) => {
      const currentMessage = await message.channel.messages.fetch(message.id);
      const currentEmbed = currentMessage.embeds[0];
      const description = currentEmbed.description || '';
      const match = description.match(/Type this object: (.+)/);
      
      if (match && m.content === match[1]) {
        this.score++;
        showObject();
      } else {
        await m.reply('Wrong object! Try again.');
      }
    });

    collector.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Time's Up!`)
          .setColor(COLORS.error)
          .setDescription(`Final Score: ${this.score}/${this.maxRounds}`)
          .setTimestamp();

        await message.edit({ embeds: [timeoutEmbed] });
      }
    });
  }
}

export default CatchGameCommand;
