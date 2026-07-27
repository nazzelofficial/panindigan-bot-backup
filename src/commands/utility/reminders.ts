// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class RemindersCommand extends BaseCommand {
  constructor() {
    super({
      name: 'reminders',
      description: 'View all your active reminders',
      category: 'utility',
      premiumTier: 'free',
      cooldown: 5,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['myreminders', 'listreminders', 'rlist'],
      examples: ['/reminders', 'p!reminders'],
    } as CommandOptions);
  }

  private async buildEmbed(userId: string): Promise<EmbedBuilder> {
    const prisma = getPrismaClient();

    let reminders: any[] = [];
    try {
      reminders = await (prisma as any).reminder.findMany({
        where: { userId, active: true, fireAt: { gte: new Date() } },
        orderBy: { fireAt: 'asc' },
        take: 25,
      });
    } catch {
      // Table may not exist yet
    }

    if (!reminders.length) {
      return new EmbedBuilder()
        .setTitle(`${EMOJIS.utility} Your Reminders`)
        .setColor(COLORS.info)
        .setDescription('You have no active reminders.\n\nUse `/remind` or `p!remind` to create one!');
    }

    const list = reminders.map((r: any, i: number) => {
      const unix = Math.floor(new Date(r.fireAt).getTime() / 1000);
      const type = r.recurring ? '🔁' : '⏰';
      return `**${i + 1}.** ${type} <t:${unix}:F> (<t:${unix}:R>)\n   📝 ${r.message?.slice(0, 80) || 'No message'}${r.recurring ? ` — \`${r.interval}\`` : ''}`;
    }).join('\n\n');

    return new EmbedBuilder()
      .setTitle(`${EMOJIS.utility} Your Active Reminders`)
      .setColor(COLORS.info)
      .setDescription(list)
      .addFields({ name: '📊 Total', value: `${reminders.length} reminder${reminders.length !== 1 ? 's' : ''}`, inline: true })
      .setFooter({ text: 'Use p!remind or /remind to add more • p!remind cancel <id> to remove' })
      .setTimestamp();
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });
    const embed = await this.buildEmbed(interaction.user.id);
    await interaction.editReply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const embed = await this.buildEmbed(message.author.id);
    await message.reply({ embeds: [embed] });
  }
}

export default RemindersCommand;
