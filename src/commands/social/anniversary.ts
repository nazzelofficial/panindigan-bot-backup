// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class AnniversaryCommand extends BaseCommand {
  constructor() {
    super({
      name: 'anniversary',
      description: 'Track your relationship anniversary date 💕',
      category: 'social',
      premiumTier: 'free',
      cooldown: 5,
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['anniv'],
      examples: ['/anniversary set 2024-01-01', '/anniversary check'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addSubcommand(sub =>
        sub
          .setName('set')
          .setDescription('Set your anniversary date')
          .addStringOption(o =>
            o.setName('date').setDescription('Anniversary date (YYYY-MM-DD)').setRequired(true)
          )
      )
      .addSubcommand(sub =>
        sub.setName('check').setDescription('Check your anniversary date')
      )
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  private formatAnniversary(date: Date): string {
    const now = new Date();
    const thisYear = new Date(now.getFullYear(), date.getMonth(), date.getDate());
    const daysUntil = Math.ceil((thisYear.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const years = now.getFullYear() - date.getFullYear();

    const dateStr = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    let msg = `📅 **Anniversary Date:** ${dateStr}\n`;
    msg += `💖 **Years Together:** ${years > 0 ? years : 0}\n`;

    if (daysUntil === 0) {
      msg += `🎉 **Today is your anniversary!** Happy anniversary! 🎊`;
    } else if (daysUntil > 0) {
      msg += `⏳ **Days Until Anniversary:** ${daysUntil} day(s)`;
    } else {
      const nextYear = new Date(now.getFullYear() + 1, date.getMonth(), date.getDate());
      const daysUntilNext = Math.ceil((nextYear.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      msg += `⏳ **Days Until Next Anniversary:** ${daysUntilNext} day(s)`;
    }
    return msg;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    try {
      const prisma = getPrismaClient();
      const userId = i.user.id;
      const sub = i.options.getSubcommand();

      const couple = await prisma.couple.findFirst({
        where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
      });

      if (!couple) {
        await i.reply({ content: '💔 You are not in a relationship! Use `/couplerequest` first.', ephemeral: true });
        return;
      }

      if (sub === 'set') {
        const dateStr = i.options.getString('date', true);
        const parsed = new Date(dateStr);

        if (isNaN(parsed.getTime())) {
          await i.reply({ content: '❌ Invalid date format. Please use **YYYY-MM-DD** (e.g., 2024-06-15).', ephemeral: true });
          return;
        }

        if (parsed > new Date()) {
          await i.reply({ content: '❌ Anniversary date cannot be in the future!', ephemeral: true });
          return;
        }

        await prisma.couple.update({
          where: { id: couple.id },
          data: { anniversaryDate: parsed },
        });

        const embed = new EmbedBuilder()
          .setTitle('💕 Anniversary Set!')
          .setDescription(`Your anniversary date has been set to **${parsed.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}** 🎉`)
          .setColor(COLORS.default)
          .setFooter({ text: "We'll remind you when it's coming up! 💖" })
          .setTimestamp();

        await i.reply({ embeds: [embed] });
      } else {
        const anniversary = (couple as any).anniversaryDate as Date | null;

        if (!anniversary) {
          await i.reply({ content: '📅 No anniversary date set yet! Use `/anniversary set` to add one.', ephemeral: true });
          return;
        }

        const embed = new EmbedBuilder()
          .setTitle('💕 Your Anniversary')
          .setDescription(this.formatAnniversary(new Date(anniversary)))
          .setColor(COLORS.default)
          .setFooter({ text: 'Love grows stronger every day 💖' })
          .setTimestamp();

        await i.reply({ embeds: [embed] });
      }
    } catch (err) {
      console.error('[AnniversaryCommand] Error:', err);
      await i.reply({ content: '❌ Something went wrong with the anniversary command.', ephemeral: true });
    }
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    try {
      const prisma = getPrismaClient();
      const userId = m.author.id;
      const sub = args[0]?.toLowerCase();

      const couple = await prisma.couple.findFirst({
        where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
      });

      if (!couple) {
        await m.reply('💔 You are not in a relationship! Use `couplerequest` first.');
        return;
      }

      if (sub === 'set') {
        const dateStr = args[1];
        if (!dateStr) {
          await m.reply('❌ Please provide a date in YYYY-MM-DD format. Example: `anniversary set 2024-06-15`');
          return;
        }

        const parsed = new Date(dateStr);
        if (isNaN(parsed.getTime())) {
          await m.reply('❌ Invalid date format. Please use **YYYY-MM-DD** (e.g., 2024-06-15).');
          return;
        }

        if (parsed > new Date()) {
          await m.reply('❌ Anniversary date cannot be in the future!');
          return;
        }

        await prisma.couple.update({
          where: { id: couple.id },
          data: { anniversaryDate: parsed },
        });

        const embed = new EmbedBuilder()
          .setTitle('💕 Anniversary Set!')
          .setDescription(`Your anniversary date has been set to **${parsed.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}** 🎉`)
          .setColor(COLORS.default)
          .setFooter({ text: "We'll remind you when it's coming up! 💖" })
          .setTimestamp();

        await m.reply({ embeds: [embed] });
      } else if (sub === 'check') {
        const anniversary = (couple as any).anniversaryDate as Date | null;

        if (!anniversary) {
          await m.reply('📅 No anniversary date set yet! Use `anniversary set YYYY-MM-DD` to add one.');
          return;
        }

        const embed = new EmbedBuilder()
          .setTitle('💕 Your Anniversary')
          .setDescription(this.formatAnniversary(new Date(anniversary)))
          .setColor(COLORS.default)
          .setFooter({ text: 'Love grows stronger every day 💖' })
          .setTimestamp();

        await m.reply({ embeds: [embed] });
      } else {
        await m.reply('❌ Usage: `anniversary set YYYY-MM-DD` or `anniversary check`');
      }
    } catch (err) {
      console.error('[AnniversaryCommand] Error:', err);
      await m.reply('❌ Something went wrong with the anniversary command.');
    }
  }
}

export default AnniversaryCommand;
