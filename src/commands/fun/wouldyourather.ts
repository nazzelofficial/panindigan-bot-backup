// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class WouldYouRatherCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'wouldyourather',
      description: 'Play would you rather',
      category: 'fun',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['wyr'],
      examples: ['/wouldyourather', 'p!wouldyourather'],
    };
    super(options);
  }

  private questions = [
    { option1: 'Have the ability to fly', option2: 'Be invisible' },
    { option1: 'Never use social media again', option2: 'Never watch movies again' },
    { option1: 'Be famous but unhappy', option2: 'Be unknown but happy' },
    { option1: 'Have unlimited money', option2: 'Have unlimited time' },
    { option1: 'Live in the past', option2: 'Live in the future' },
    { option1: 'Be able to speak all languages', option2: 'Be able to talk to animals' },
    { option1: 'Have no internet', option2: 'Have no air conditioning' },
    { option1: 'Be able to teleport', option2: 'Be able to read minds' },
    { option1: 'Eat only pizza for life', option2: 'Eat only burgers for life' },
    { option1: 'Always be 10 minutes late', option2: 'Always be 20 minutes early' },
  ];

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const question = this.questions[Math.floor(Math.random() * this.questions.length)];

    const option1 = new ButtonBuilder()
      .setCustomId('option1')
      .setLabel(question.option1)
      .setStyle(ButtonStyle.Primary);

    const option2 = new ButtonBuilder()
      .setCustomId('option2')
      .setLabel(question.option2)
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(option1, option2);

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 🤔 Would You Rather`)
      .setColor(COLORS.info)
      .setDescription(`**Would you rather...**`)
      .addFields([
        { name: 'Option 1', value: question.option1, inline: true },
        { name: 'Option 2', value: question.option2, inline: true },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed], components: [row] });

    const collector = interaction.channel?.createMessageComponentCollector({
      filter: (i) => i.user.id === interaction.user.id,
      time: 60000,
    });

    collector?.on('collect', async (i) => {
      const choice = i.customId === 'option1' ? question.option1 : question.option2;
      const resultEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.fun} 🤔 Your Choice`)
        .setColor(COLORS.success)
        .setDescription(`You chose: **${choice}**`)
        .setTimestamp();

      await i.update({ embeds: [resultEmbed], components: [] });
      collector.stop();
    });

    collector?.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Time's Up!`)
          .setColor(COLORS.error)
          .setDescription('You didn\'t choose in time!')
          .setTimestamp();

        await interaction.editReply({ embeds: [timeoutEmbed], components: [] });
      }
    });
  }

  public async executePrefix(message: Message): Promise<void> {
    const question = this.questions[Math.floor(Math.random() * this.questions.length)];

    const option1 = new ButtonBuilder()
      .setCustomId('option1')
      .setLabel(question.option1)
      .setStyle(ButtonStyle.Primary);

    const option2 = new ButtonBuilder()
      .setCustomId('option2')
      .setLabel(question.option2)
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(option1, option2);

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.fun} 🤔 Would You Rather`)
      .setColor(COLORS.info)
      .setDescription(`**Would you rather...**`)
      .addFields([
        { name: 'Option 1', value: question.option1, inline: true },
        { name: 'Option 2', value: question.option2, inline: true },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed], components: [row] });

    const collector = message.channel.createMessageComponentCollector({
      filter: (i) => i.user.id === message.author.id,
      time: 60000,
    });

    collector.on('collect', async (i) => {
      const choice = i.customId === 'option1' ? question.option1 : question.option2;
      const resultEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.fun} 🤔 Your Choice`)
        .setColor(COLORS.success)
        .setDescription(`You chose: **${choice}**`)
        .setTimestamp();

      await i.update({ embeds: [resultEmbed], components: [] });
      collector.stop();
    });

    collector.on('end', async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Time's Up!`)
          .setColor(COLORS.error)
          .setDescription('You didn\'t choose in time!')
          .setTimestamp();

        await message.edit({ embeds: [timeoutEmbed], components: [] });
      }
    });
  }
}

export default WouldYouRatherCommand;
