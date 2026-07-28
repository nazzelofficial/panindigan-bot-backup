// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class RemindCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'remind',
      description: 'Set a reminder for yourself',
      category: 'utility',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['reminder'],
      examples: ['/remind 30m Take a break', 'p!remind 1h Meeting'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const time = interaction.options.getString('time');
    const message = interaction.options.getString('message');
    
    if (!time) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a time (e.g., 30m, 1h, 2d).')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    if (!message) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a message for the reminder.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const duration = this.parseTime(time);
    if (!duration) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Invalid time format. Use format like 30m, 1h, 2d.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} ⏰ Reminder Set`)
      .setColor(COLORS.info)
      .setDescription(`I will remind you in ${time}: **${message}**`)
      .addFields([
        { name: 'Time', value: time, inline: true },
        { name: 'Message', value: message, inline: true },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    setTimeout(async () => {
      try {
        const user = await interaction.client.users.fetch(interaction.user.id);
        const reminderEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.info} ⏰ Reminder`)
          .setColor(COLORS.info)
          .setDescription(`**${message}**`)
          .setFooter({ text: 'Set ' + new Date().toLocaleString() })
          .setTimestamp();

        await user.send({ embeds: [reminderEmbed] });
      } catch (error) {
        console.error('Could not send reminder DM:', error);
      }
    }, duration);
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const time = args[0];
    const reminderMessage = args.slice(1).join(' ');

    if (!time) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a time (e.g., 30m, 1h, 2d).')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    if (!reminderMessage) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a message for the reminder.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const duration = this.parseTime(time);
    if (!duration) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Invalid time format. Use format like 30m, 1h, 2d.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} ⏰ Reminder Set`)
      .setColor(COLORS.info)
      .setDescription(`I will remind you in ${time}: **${reminderMessage}**`)
      .addFields([
        { name: 'Time', value: time, inline: true },
        { name: 'Message', value: reminderMessage, inline: true },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });

    setTimeout(async () => {
      try {
        const user = await message.client.users.fetch(message.author.id);
        const reminderEmbed = new EmbedBuilder()
          .setTitle(`${EMOJIS.info} ⏰ Reminder`)
          .setColor(COLORS.info)
          .setDescription(`**${reminderMessage}**`)
          .setFooter({ text: 'Set ' + new Date().toLocaleString() })
          .setTimestamp();

        await user.send({ embeds: [reminderEmbed] });
      } catch (error) {
        console.error('Could not send reminder DM:', error);
      }
    }, duration);
  }

  private parseTime(time: string): number | null {
    const match = time.match(/^(\d+)([smhd])$/);
    if (!match) return null;

    const value = parseInt(match[1]);
    const unit = match[2];

    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60000,
      h: 3600000,
      d: 86400000,
    };

    return value * (multipliers[unit] || 0);
  }
}

export default RemindCommand;
