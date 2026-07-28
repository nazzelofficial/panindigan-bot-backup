// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { PALETTE, KIT, errorEmbed } from '../../utils/EmbedSystem.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
import config from '../../../config.json' with { type: 'json' };

const JOBS = [
  { name: 'Software Developer', emoji: '💻', min: 350, max: 650, flavor: 'Fixed a critical bug in production' },
  { name: 'Teacher',            emoji: '📚', min: 200, max: 420, flavor: 'Taught a class of eager students' },
  { name: 'Doctor',             emoji: '🏥', min: 400, max: 750, flavor: 'Treated 12 patients today' },
  { name: 'Chef',               emoji: '👨‍🍳', min: 250, max: 500, flavor: 'Cooked a perfect 5-star meal' },
  { name: 'Artist',             emoji: '🎨', min: 150, max: 400, flavor: 'Sold a painting at the gallery' },
  { name: 'Engineer',           emoji: '⚙️', min: 380, max: 700, flavor: 'Designed a new mechanical component' },
  { name: 'Writer',             emoji: '✍️', min: 180, max: 450, flavor: 'Finished writing a chapter' },
  { name: 'Streamer',           emoji: '🎮', min: 100, max: 600, flavor: 'Hit a subscriber milestone' },
  { name: 'Trader',             emoji: '📊', min: 200, max: 800, flavor: 'Made a smart market move' },
  { name: 'Nurse',              emoji: '💊', min: 300, max: 550, flavor: 'Cared for patients overnight' },
  { name: 'Carpenter',          emoji: '🪚', min: 220, max: 480, flavor: 'Built beautiful custom furniture' },
  { name: 'Musician',           emoji: '🎵', min: 150, max: 500, flavor: 'Performed at a local venue' },
];

export class WorkCommand extends BaseCommand {
  constructor() {
    super({
      name: 'work', description: 'Work a job to earn ₱ Piso', category: 'economy',
      cooldown: 60, userPermissions: [], botPermissions: [], guildOnly: true,
      slashCommand: true, prefixCommand: true,
      aliases: ['job', 'earn'], examples: ['/work', 'p!work'],
    });
  }

  private async run(userId: string, guildId: string, userObj: any): Promise<EmbedBuilder> {
    const prisma = getPrismaClient();

    const guild = await prisma.guild.upsert({
      where: { guildId }, update: {}, create: { guildId },
    });
    const symbol = guild?.currencySymbol ?? config.economy?.currencySymbol ?? '₱';
    const mult   = guild?.workMultiplier ?? 1;

    const job      = JOBS[Math.floor(Math.random() * JOBS.length)];
    const base     = Math.floor(Math.random() * (job.max - job.min + 1)) + job.min;
    const earnings = Math.floor(base * mult);

    await prisma.economy.upsert({
      where: { userId_guildId: { userId, guildId } },
      update: { wallet: { increment: earnings } },
      create: { userId, guildId, wallet: earnings, bank: 0 },
    });

    return new EmbedBuilder()
      .setColor(PALETTE.economy)
      .setAuthor({ name: `${userObj.username} — Work`, iconURL: userObj.displayAvatarURL({ size: 64 }) })
      .setDescription(`${job.emoji} *${job.flavor}*`)
      .addFields(
        { name: `💼 Job`,        value: `**${job.name}**`,                          inline: true },
        { name: `${KIT.economy} Earned`, value: `**${symbol}${earnings.toLocaleString()}**`, inline: true },
        { name: `⏳ Cooldown`,   value: `<t:${Math.floor((Date.now() + 60_000) / 1000)}:R>`, inline: true },
      )
      .setFooter({ text: 'Work again after the cooldown for more earnings!' })
      .setTimestamp();
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();
    try {
      await interaction.editReply({ embeds: [await this.run(interaction.user.id, interaction.guildId!, interaction.user)] });
    } catch {
      await interaction.editReply({ embeds: [errorEmbed('Work Failed', 'Failed to process your work. Try again.')] });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    try {
      await message.reply({ embeds: [await this.run(message.author.id, message.guildId!, message.author)] });
    } catch {
      await message.reply({ embeds: [errorEmbed('Work Failed', 'Failed to process your work.')] });
    }
  }
}
export default WorkCommand;
