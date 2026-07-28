// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import {
  ChatInputCommandInteraction,
  Message,
  EmbedBuilder,
  SlashCommandBuilder,
  GuildMember,
} from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

function getDaysUntilBirthday(birthday: Date): number {
  const now = new Date();
  const next = new Date(now.getFullYear(), birthday.getMonth(), birthday.getDate());
  if (next < now) next.setFullYear(now.getFullYear() + 1);
  const diff = Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

function formatBirthday(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
}

export class BirthdayCommand extends BaseCommand {
  constructor() {
    super({
      name: 'bday',
      description: 'Set, view, or list birthdays in the server',
      category: 'utility',
      premiumTier: 'free',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['bday', 'bd'],
      examples: [
        '/birthday set date:1999-05-20',
        '/birthday view user:@someone',
        '/birthday list',
        'p!birthday set 1999-05-20',
        'p!birthday list',
      ],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addSubcommand(sub =>
        sub.setName('set')
          .setDescription('Set your birthday')
          .addStringOption(o =>
            o.setName('date')
              .setDescription('Your birthday in YYYY-MM-DD format (e.g. 1999-05-20)')
              .setRequired(true),
          ),
      )
      .addSubcommand(sub =>
        sub.setName('view')
          .setDescription("View a user's birthday")
          .addUserOption(o =>
            o.setName('user').setDescription('User to check (default: yourself)').setRequired(false),
          ),
      )
      .addSubcommand(sub =>
        sub.setName('list').setDescription('List upcoming birthdays in this server'),
      )
      .addSubcommand(sub =>
        sub.setName('remove').setDescription('Remove your birthday from the bot'),
      )
      .setDMPermission(false) as SlashCommandBuilder;
  }

  private async handleSet(
    userId: string,
    guildId: string,
    dateStr: string,
    reply: (opts: any) => Promise<any>,
  ): Promise<void> {
    const parsed = new Date(dateStr);
    if (isNaN(parsed.getTime())) {
      await reply({
        content: `${EMOJIS.error} Invalid date format. Use **YYYY-MM-DD** (e.g. \`1999-05-20\`).`,
        ephemeral: true,
      });
      return;
    }
    const year = parsed.getFullYear();
    if (year < 1900 || year > new Date().getFullYear()) {
      await reply({
        content: `${EMOJIS.error} Invalid year. Year must be between 1900 and ${new Date().getFullYear()}.`,
        ephemeral: true,
      });
      return;
    }

    const prisma = getPrismaClient();
    await prisma.user.upsert({
      where: { userId_guildId: { userId, guildId } },
      create: { userId, guildId, birthday: parsed },
      update: { birthday: parsed },
    });

    const daysUntil = getDaysUntilBirthday(parsed);
    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.success} 🎂 Birthday Set!`)
      .setColor(COLORS.success)
      .setDescription(`Your birthday has been set to **${formatBirthday(parsed)}**!`)
      .addFields(
        { name: '📅 Birthday', value: formatBirthday(parsed), inline: true },
        {
          name: '⏳ Next Birthday',
          value: daysUntil === 0 ? '🎉 Today!' : `In **${daysUntil}** day${daysUntil === 1 ? '' : 's'}`,
          inline: true,
        },
      )
      .setTimestamp();

    await reply({ embeds: [embed] });
  }

  private async handleView(
    targetUserId: string,
    targetUsername: string,
    guildId: string,
    reply: (opts: any) => Promise<any>,
  ): Promise<void> {
    const prisma = getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { userId_guildId: { userId: targetUserId, guildId } },
    });

    if (!user?.birthday) {
      await reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('🎂 Birthday')
            .setColor(COLORS.warning)
            .setDescription(`**${targetUsername}** hasn't set their birthday yet.`),
        ],
      });
      return;
    }

    const daysUntil = getDaysUntilBirthday(user.birthday);
    const embed = new EmbedBuilder()
      .setTitle(`🎂 ${targetUsername}'s Birthday`)
      .setColor(COLORS.gold)
      .addFields(
        { name: '📅 Birthday', value: formatBirthday(user.birthday), inline: true },
        {
          name: '⏳ Next Birthday',
          value: daysUntil === 0 ? '🎉 Today! Happy Birthday!' : `In **${daysUntil}** day${daysUntil === 1 ? '' : 's'}`,
          inline: true,
        },
      )
      .setTimestamp();

    await reply({ embeds: [embed] });
  }

  private async handleList(guildId: string, reply: (opts: any) => Promise<any>): Promise<void> {
    const prisma = getPrismaClient();
    const users = await prisma.user.findMany({
      where: { guildId, birthday: { not: null } },
      select: { userId: true, birthday: true },
    });

    if (!users.length) {
      await reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('🎂 Upcoming Birthdays')
            .setColor(COLORS.info)
            .setDescription('No birthdays have been set in this server yet.'),
        ],
      });
      return;
    }

    const now = new Date();
    const sorted = users
      .map(u => ({
        userId: u.userId,
        birthday: u.birthday!,
        daysUntil: getDaysUntilBirthday(u.birthday!),
      }))
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 15);

    const lines = sorted.map((u, i) => {
      const isToday = u.daysUntil === 0;
      const prefix = isToday ? '🎉' : `${i + 1}.`;
      const dayStr = isToday ? '**Today!**' : `in ${u.daysUntil}d`;
      return `${prefix} <@${u.userId}> — **${formatBirthday(u.birthday)}** (${dayStr})`;
    });

    const embed = new EmbedBuilder()
      .setTitle('🎂 Upcoming Birthdays')
      .setColor(COLORS.gold)
      .setDescription(lines.join('\n'))
      .setFooter({ text: `${users.length} birthday${users.length === 1 ? '' : 's'} registered` })
      .setTimestamp();

    await reply({ embeds: [embed] });
  }

  private async handleRemove(
    userId: string,
    guildId: string,
    reply: (opts: any) => Promise<any>,
  ): Promise<void> {
    const prisma = getPrismaClient();
    const existing = await prisma.user.findUnique({
      where: { userId_guildId: { userId, guildId } },
    });

    if (!existing?.birthday) {
      await reply({ content: `${EMOJIS.warning} You haven't set a birthday yet.`, ephemeral: true });
      return;
    }

    await prisma.user.update({
      where: { userId_guildId: { userId, guildId } },
      data: { birthday: null },
    });

    await reply({ content: `${EMOJIS.success} Your birthday has been removed.`, ephemeral: true });
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const sub = interaction.options.getSubcommand();
    const guildId = interaction.guildId!;

    if (sub === 'set') {
      const dateStr = interaction.options.getString('date', true);
      await this.handleSet(interaction.user.id, guildId, dateStr, opts => interaction.reply(opts));
    } else if (sub === 'view') {
      const target = interaction.options.getUser('user') || interaction.user;
      await this.handleView(target.id, target.username, guildId, opts => interaction.reply(opts));
    } else if (sub === 'list') {
      await this.handleList(guildId, opts => interaction.reply(opts));
    } else if (sub === 'remove') {
      await this.handleRemove(interaction.user.id, guildId, opts => interaction.reply(opts));
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const sub = args[0]?.toLowerCase() || 'view';
    const guildId = message.guildId!;

    if (sub === 'set') {
      const dateStr = args[1];
      if (!dateStr) {
        return void message.reply(
          `${EMOJIS.error} Usage: \`p!birthday set YYYY-MM-DD\` (e.g. \`p!birthday set 1999-05-20\`)`,
        );
      }
      await this.handleSet(message.author.id, guildId, dateStr, opts => message.reply(opts));
    } else if (sub === 'list') {
      await this.handleList(guildId, opts => message.reply(opts));
    } else if (sub === 'remove') {
      await this.handleRemove(message.author.id, guildId, opts => message.reply(opts));
    } else {
      // view — mention or self
      const target = message.mentions.users.first() || message.author;
      await this.handleView(target.id, target.username, guildId, opts => message.reply(opts));
    }
  }
}

export default BirthdayCommand;
