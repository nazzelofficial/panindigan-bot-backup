// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class VipBadgeCommand extends BaseCommand {
  constructor() {
    super({
      name: 'vipbadge',
      description: 'Equip your Diamond VIP badge on your profile',
      category: 'premium',
      premiumTier: 'diamond',
      cooldown: 10,
      ownerOnly: false,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['diamondbadge', 'vip-badge'],
      examples: ['/vipbadge', 'p!vipbadge'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .setDMPermission(true) as SlashCommandBuilder;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    try {
      const prisma = getPrismaClient();
      await prisma.user.updateMany({
        where: { userId: i.user.id },
        data: { badge: 'diamond_vip' } as any,
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.diamond} Diamond VIP Badge Equipped`)
        .setColor(COLORS.diamond)
        .setThumbnail(i.user.displayAvatarURL())
        .setDescription(
          `Your **Diamond VIP** badge has been equipped on your profile!\n\n` +
          `This exclusive badge is only available to Diamond tier subscribers and marks you as a top supporter of Panindigan.`
        )
        .addFields(
          { name: '💎 Badge', value: '`👑 Diamond VIP`', inline: true },
          { name: '✨ Status', value: 'Equipped', inline: true },
          { name: '🌟 Visibility', value: 'Shown on profile & leaderboards', inline: false },
        )
        .setFooter({ text: 'Your exclusive Diamond VIP badge is now active!' })
        .setTimestamp();

      await i.reply({ embeds: [embed], ephemeral: true });
    } catch (err: any) {
      await i.reply({ content: `${EMOJIS.error} Error equipping badge: ${err.message || 'Unknown error'}`, ephemeral: true });
    }
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    try {
      const prisma = getPrismaClient();
      await prisma.user.updateMany({
        where: { userId: m.author.id },
        data: { badge: 'diamond_vip' } as any,
      });

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.diamond} Diamond VIP Badge Equipped`)
        .setColor(COLORS.diamond)
        .setThumbnail(m.author.displayAvatarURL())
        .setDescription(
          `Your **Diamond VIP** badge has been equipped on your profile!\n\n` +
          `This exclusive badge marks you as a top supporter of Panindigan.`
        )
        .addFields(
          { name: '💎 Badge', value: '`👑 Diamond VIP`', inline: true },
          { name: '✨ Status', value: 'Equipped', inline: true },
        )
        .setTimestamp();

      await m.reply({ embeds: [embed] });
    } catch (err: any) {
      await m.reply(`${EMOJIS.error} Error equipping badge: ${err.message || 'Unknown error'}`);
    }
  }
}

export default VipBadgeCommand;
