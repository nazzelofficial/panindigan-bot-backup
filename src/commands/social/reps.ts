// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class RepsCommand extends BaseCommand {
  constructor() {
    super({
      name: 'reps',
      description: 'Tingnan ang reputation count ng user',
      category: 'social',
      premiumTier: 'silver',
      cooldown: 5,
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['reputation', 'rep'],
      examples: ['reps @User', 'reps'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addUserOption(o =>
        o.setName('user').setDescription('Target user').setRequired(false)
      )
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply();
    try {
      const target = i.options.getUser('user') ?? i.user;
      const prisma = getPrismaClient();

      const userData = await (prisma as any).user.findUnique({
        where: { discordId: target.id },
        select: { reputation: true },
      });

      const repCount = userData?.reputation ?? 0;

      const embed = new EmbedBuilder()
        .setColor(COLORS.PRIMARY as any)
        .setTitle('⭐ Reputation Count')
        .setDescription(
          `**${target.username}** ay may **${repCount}** reputation point${repCount !== 1 ? 's' : ''}!`
        )
        .setThumbnail(target.displayAvatarURL({ size: 128 }))
        .setFooter({ text: 'Panindigan Bot • Reputation System' })
        .setTimestamp();

      await i.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('[RepsCommand] Error:', error);
      await i.editReply({ content: '❌ May error habang kinukuha ang reputation. Subukan ulit mamaya.' });
    }
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    try {
      const target = m.mentions.users.first() ?? m.author;
      const prisma = getPrismaClient();

      const userData = await (prisma as any).user.findUnique({
        where: { discordId: target.id },
        select: { reputation: true },
      });

      const repCount = userData?.reputation ?? 0;

      const embed = new EmbedBuilder()
        .setColor(COLORS.PRIMARY as any)
        .setTitle('⭐ Reputation Count')
        .setDescription(
          `**${target.username}** ay may **${repCount}** reputation point${repCount !== 1 ? 's' : ''}!`
        )
        .setThumbnail(target.displayAvatarURL({ size: 128 }))
        .setFooter({ text: 'Panindigan Bot • Reputation System' })
        .setTimestamp();

      await m.reply({ embeds: [embed] });
    } catch (error) {
      console.error('[RepsCommand] Error:', error);
      await m.reply('❌ May error habang kinukuha ang reputation. Subukan ulit mamaya.');
    }
  }
}

export default RepsCommand;
