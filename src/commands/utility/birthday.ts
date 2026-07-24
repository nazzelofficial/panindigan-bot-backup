import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class BirthdayCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'birthday',
      description: 'Set or view your birthday',
      category: 'utility',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['bday'],
      examples: ['/birthday 1990-01-15', '/birthday view', 'p!birthday 1990-01-15'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const action = interaction.options.getString('action') || 'view';
    const date = interaction.options.getString('date');

    if (action === 'set') {
      if (!date) {
        const errorEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Error`)
          .setColor(COLORS.error)
          .setDescription('Please provide a date in YYYY-MM-DD format.')
          .setTimestamp();

        await interaction.reply({ embeds: [errorEmbed] });
        return;
      }

      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        const errorEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Error`)
          .setColor(COLORS.error)
          .setDescription('Invalid date format. Use YYYY-MM-DD format.')
          .setTimestamp();

        await interaction.reply({ embeds: [errorEmbed] });
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.info} 🎂 Birthday Set`)
        .setColor(COLORS.info)
        .setDescription(`Your birthday has been set to ${date}.`)
        .addFields([
          { name: 'Status', value: 'Database integration pending', inline: false },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } else {
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.info} 🎂 Birthday`)
        .setColor(COLORS.info)
        .setDescription('This is a placeholder. Birthday information will be implemented with database integration.')
        .addFields([
          { name: 'Status', value: 'Database integration pending', inline: false },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    }
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const action = args[0] || 'view';
    const date = args[1];

    if (action === 'set') {
      if (!date) {
        const errorEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Error`)
          .setColor(COLORS.error)
          .setDescription('Please provide a date in YYYY-MM-DD format.')
          .setTimestamp();

        await message.reply({ embeds: [errorEmbed] });
        return;
      }

      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        const errorEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Error`)
          .setColor(COLORS.error)
          .setDescription('Invalid date format. Use YYYY-MM-DD format.')
          .setTimestamp();

        await message.reply({ embeds: [errorEmbed] });
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.info} 🎂 Birthday Set`)
        .setColor(COLORS.info)
        .setDescription(`Your birthday has been set to ${date}.`)
        .addFields([
          { name: 'Status', value: 'Database integration pending', inline: false },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } else {
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.info} 🎂 Birthday`)
        .setColor(COLORS.info)
        .setDescription('This is a placeholder. Birthday information will be implemented with database integration.')
        .addFields([
          { name: 'Status', value: 'Database integration pending', inline: false },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    }
  }
}

export default BirthdayCommand;
