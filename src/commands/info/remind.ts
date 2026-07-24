import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

function parseTime(input: string): number | null {
  const regex = /(\d+)\s*(s|sec|seconds?|m|min|minutes?|h|hr|hours?|d|days?)/gi;
  let ms = 0;
  let matched = false;
  let match;
  while ((match = regex.exec(input)) !== null) {
    matched = true;
    const val = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    if (unit.startsWith('s')) ms += val * 1000;
    else if (unit.startsWith('m')) ms += val * 60000;
    else if (unit.startsWith('h')) ms += val * 3600000;
    else if (unit.startsWith('d')) ms += val * 86400000;
  }
  return matched ? ms : null;
}

const MAX_REMIND_MS = 7 * 24 * 3600000; // 7 days

export class RemindCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'remind',
      description: 'Set a reminder',
      category: 'info',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['reminder', 'remindme'],
      examples: ['/remind 30m Take a break', 'p!remind 1h Check the oven'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o => o.setName('time').setDescription('When to remind (e.g., 30m, 2h, 1d)').setRequired(true))
      .addStringOption(o => o.setName('message').setDescription('Reminder message').setRequired(true)) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const timeStr = interaction.options.getString('time', true);
    const reminderMsg = interaction.options.getString('message', true);
    const ms = parseTime(timeStr);
    if (!ms || ms <= 0) {
      await interaction.reply({ content: `${EMOJIS.error} Invalid time format. Examples: \`30s\`, \`5m\`, \`2h\`, \`1d\``, ephemeral: true });
      return;
    }
    if (ms > MAX_REMIND_MS) {
      await interaction.reply({ content: `${EMOJIS.error} Maximum reminder time is 7 days.`, ephemeral: true });
      return;
    }
    const fireAt = Date.now() + ms;
    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} ⏰ Reminder Set!`)
      .setColor(COLORS.success)
      .addFields(
        { name: '📝 Reminder', value: reminderMsg.slice(0, 1024), inline: false },
        { name: '⏰ Fires', value: `<t:${Math.floor(fireAt / 1000)}:R> (<t:${Math.floor(fireAt / 1000)}:T>)`, inline: false }
      )
      .setFooter({ text: `Reminder for ${interaction.user.tag}` })
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });

    // Schedule the reminder
    const userId = interaction.user.id;
    const channel = interaction.channel;
    setTimeout(async () => {
      try {
        const notifEmbed = new EmbedBuilder()
          .setTitle(`⏰ Reminder!`)
          .setColor(COLORS.warning)
          .setDescription(`<@${userId}> — **${reminderMsg.slice(0, 1024)}**`)
          .setFooter({ text: 'You asked me to remind you!' })
          .setTimestamp();
        if (channel?.isTextBased()) {
          await channel.send({ content: `<@${userId}>`, embeds: [notifEmbed] });
        } else {
          const user = await interaction.client.users.fetch(userId).catch(() => null);
          if (user) await user.send({ embeds: [notifEmbed] }).catch(() => {});
        }
      } catch { /* Silently fail if channel is gone */ }
    }, ms);
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const timeStr = args[0];
    const reminderMsg = args.slice(1).join(' ');
    if (!timeStr || !reminderMsg) {
      return void message.reply(`${EMOJIS.error} Usage: \`p!remind <time> <message>\` (e.g., \`p!remind 30m Take a break\`)`);
    }
    const ms = parseTime(timeStr);
    if (!ms || ms <= 0) {
      return void message.reply(`${EMOJIS.error} Invalid time. Examples: \`30s\`, \`5m\`, \`2h\`, \`1d\``);
    }
    if (ms > MAX_REMIND_MS) return void message.reply(`${EMOJIS.error} Maximum reminder time is 7 days.`);

    const fireAt = Date.now() + ms;
    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} ⏰ Reminder Set!`)
      .setColor(COLORS.success)
      .addFields(
        { name: '📝 Reminder', value: reminderMsg.slice(0, 1024), inline: false },
        { name: '⏰ Fires', value: `<t:${Math.floor(fireAt / 1000)}:R>`, inline: false }
      )
      .setTimestamp();
    await message.reply({ embeds: [embed] });

    const userId = message.author.id;
    const channel = message.channel;
    setTimeout(async () => {
      try {
        await channel.send({ content: `<@${userId}>`, embeds: [
          new EmbedBuilder().setTitle('⏰ Reminder!').setColor(COLORS.warning)
            .setDescription(`<@${userId}> — **${reminderMsg.slice(0, 1024)}**`)
            .setFooter({ text: 'You asked me to remind you!' }).setTimestamp()
        ]});
      } catch { /* Channel may be gone */ }
    }, ms);
  }
}

export default RemindCommand;
