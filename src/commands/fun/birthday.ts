// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { connectMongoDB } from '../../database/mongodb/client.js';

interface BirthdayDoc {
  userId: string;
  guildId: string;
  month: number;
  day: number;
  username: string;
}

export class BirthdayCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'birthday',
      description: 'Set or view birthdays',
      category: 'fun',
      premiumTier: 'bronze',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      ownerOnly: false,
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['bday'],
      examples: ['/birthday set date:12/25', '/birthday list', 'p!birthday set 12/25', 'p!birthday list'],
    };
    super(options);
  }

  private parseDate(dateStr: string): { month: number; day: number } | null {
    const match = dateStr.match(/^(\d{1,2})\/(\d{1,2})$/);
    if (!match) return null;
    const month = parseInt(match[1], 10);
    const day = parseInt(match[2], 10);
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    return { month, day };
  }

  private monthName(month: number): string {
    return ['January','February','March','April','May','June','July','August','September','October','November','December'][month - 1];
  }

  private async setOrUpdateBirthday(userId: string, guildId: string, username: string, month: number, day: number): Promise<void> {
    const db = await connectMongoDB();
    const col = db.collection<BirthdayDoc>('birthdays');
    await col.updateOne(
      { userId, guildId },
      { $set: { userId, guildId, month, day, username } },
      { upsert: true }
    );
  }

  private async getBirthdays(guildId: string): Promise<BirthdayDoc[]> {
    const db = await connectMongoDB();
    const col = db.collection<BirthdayDoc>('birthdays');
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();

    const all = await col.find({ guildId }).toArray();
    all.sort((a, b) => {
      const aDays = a.month * 32 + a.day;
      const bDays = b.month * 32 + b.day;
      const aUpcoming = aDays >= currentMonth * 32 + currentDay ? aDays : aDays + 12 * 32;
      const bUpcoming = bDays >= currentMonth * 32 + currentDay ? bDays : bDays + 12 * 32;
      return aUpcoming - bUpcoming;
    });
    return all;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const sub = interaction.options.getSubcommand();

    if (sub === 'set') {
      const dateStr = interaction.options.getString('date', true);
      const parsed = this.parseDate(dateStr);
      if (!parsed) {
        const embed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Invalid Date`)
          .setDescription('Please provide a valid date in `MM/DD` format, e.g. `12/25`')
          .setColor(COLORS.error);
        await interaction.reply({ embeds: [embed], ephemeral: true });
        return;
      }

      await this.setOrUpdateBirthday(
        interaction.user.id,
        interaction.guildId!,
        interaction.user.username,
        parsed.month,
        parsed.day
      );

      const embed = new EmbedBuilder()
        .setTitle('🎂 Birthday Set!')
        .setDescription(`Your birthday has been set to **${this.monthName(parsed.month)} ${parsed.day}**!`)
        .setColor(COLORS.success)
        .setTimestamp();
      await interaction.reply({ embeds: [embed] });
    } else {
      const birthdays = await this.getBirthdays(interaction.guildId!);
      if (!birthdays.length) {
        const embed = new EmbedBuilder()
          .setTitle('🎂 Server Birthdays')
          .setDescription('No birthdays have been set yet!')
          .setColor(COLORS.info);
        await interaction.reply({ embeds: [embed] });
        return;
      }

      const lines = birthdays.slice(0, 20).map((b, i) =>
        `${i + 1}. **${b.username}** — ${this.monthName(b.month)} ${b.day}`
      );

      const embed = new EmbedBuilder()
        .setTitle('🎂 Upcoming Birthdays')
        .setDescription(lines.join('\n'))
        .setColor(COLORS.default)
        .setFooter({ text: `${birthdays.length} birthdays registered` })
        .setTimestamp();
      await interaction.reply({ embeds: [embed] });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const sub = args[0]?.toLowerCase();

    if (sub === 'set') {
      const dateStr = args[1];
      if (!dateStr) {
        const embed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Missing Date`)
          .setDescription('Usage: `p!birthday set MM/DD`')
          .setColor(COLORS.error);
        await message.reply({ embeds: [embed] });
        return;
      }

      const parsed = this.parseDate(dateStr);
      if (!parsed) {
        const embed = new EmbedBuilder()
          .setTitle(`${EMOJIS.error} Invalid Date`)
          .setDescription('Please provide a valid date in `MM/DD` format, e.g. `12/25`')
          .setColor(COLORS.error);
        await message.reply({ embeds: [embed] });
        return;
      }

      await this.setOrUpdateBirthday(
        message.author.id,
        message.guildId!,
        message.author.username,
        parsed.month,
        parsed.day
      );

      const embed = new EmbedBuilder()
        .setTitle('🎂 Birthday Set!')
        .setDescription(`Your birthday has been set to **${this.monthName(parsed.month)} ${parsed.day}**!`)
        .setColor(COLORS.success)
        .setTimestamp();
      await message.reply({ embeds: [embed] });
    } else if (sub === 'list') {
      const birthdays = await this.getBirthdays(message.guildId!);
      if (!birthdays.length) {
        const embed = new EmbedBuilder()
          .setTitle('🎂 Server Birthdays')
          .setDescription('No birthdays have been set yet!')
          .setColor(COLORS.info);
        await message.reply({ embeds: [embed] });
        return;
      }

      const lines = birthdays.slice(0, 20).map((b, i) =>
        `${i + 1}. **${b.username}** — ${this.monthName(b.month)} ${b.day}`
      );

      const embed = new EmbedBuilder()
        .setTitle('🎂 Upcoming Birthdays')
        .setDescription(lines.join('\n'))
        .setColor(COLORS.default)
        .setFooter({ text: `${birthdays.length} birthdays registered` })
        .setTimestamp();
      await message.reply({ embeds: [embed] });
    } else {
      const embed = new EmbedBuilder()
        .setTitle('🎂 Birthday Command')
        .setDescription('**Subcommands:**\n`set MM/DD` — Set your birthday\n`list` — View server birthdays')
        .setColor(COLORS.info);
      await message.reply({ embeds: [embed] });
    }
  }
}

export default BirthdayCommand;
