// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class ClaimBountyCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'claimbounty',
      description: 'Claim a bounty on a user',
      category: 'economy',
      cooldown: 60,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['collectbounty', 'claim'],
      examples: ['/claimbounty @user', 'p!claimbounty @user'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const targetUser = interaction.options.getUser('user');

    if (!targetUser || targetUser.id === interaction.user.id) {
      await interaction.reply({ content: '❌ You cannot claim a bounty on yourself.', ephemeral: true });
      return;
    }

    if (!interaction.guildId) return;

    try {
      const prisma = getPrismaClient();
      const guild = await prisma.guild.upsert({
        where: { guildId: interaction.guildId },
        update: {},
        create: { guildId: interaction.guildId },
      });

      const bounty = await prisma.bounty.findUnique({
        where: { targetId_guildId: { targetId: targetUser.id, guildId: interaction.guildId } },
      });

      if (!bounty || bounty.amount <= 0) {
        await interaction.reply({ content: '❌ No active bounty on this user.', ephemeral: true });
        return;
      }

      const successChance = Math.random();
      if (successChance < 0.5) {
        await interaction.reply({ content: '❌ Failed to claim the bounty. Try again!', ephemeral: true });
        return;
      }

      await prisma.$transaction([
        prisma.bounty.delete({
          where: { targetId_guildId: { targetId: targetUser.id, guildId: interaction.guildId } },
        }),
        prisma.economy.upsert({
          where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId } },
          update: { wallet: { increment: bounty.amount } },
          create: { userId: interaction.user.id, guildId: interaction.guildId, wallet: bounty.amount, bank: 0 },
        }),
      ]);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Bounty Claimed`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Target', value: targetUser.tag, inline: true },
          { name: 'Bounty Claimed', value: `${bounty.amount} ${guild.currencySymbol || '💰'}`, inline: true },
          { name: 'Claimed By', value: interaction.user.tag, inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: '❌ Failed to claim bounty.', ephemeral: true });
    }
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const targetUser = message.mentions.users.first();

    if (!targetUser || targetUser.id === message.author.id) {
      await message.reply('❌ You cannot claim a bounty on yourself.');
      return;
    }

    if (!message.guildId) return;

    try {
      const prisma = getPrismaClient();
      const guild = await prisma.guild.upsert({
        where: { guildId: message.guildId },
        update: {},
        create: { guildId: message.guildId },
      });

      const bounty = await prisma.bounty.findUnique({
        where: { targetId_guildId: { targetId: targetUser.id, guildId: message.guildId } },
      });

      if (!bounty || bounty.amount <= 0) {
        await message.reply('❌ No active bounty on this user.');
        return;
      }

      const successChance = Math.random();
      if (successChance < 0.5) {
        await message.reply('❌ Failed to claim the bounty. Try again!');
        return;
      }

      await prisma.$transaction([
        prisma.bounty.delete({
          where: { targetId_guildId: { targetId: targetUser.id, guildId: message.guildId } },
        }),
        prisma.economy.upsert({
          where: { userId_guildId: { userId: message.author.id, guildId: message.guildId } },
          update: { wallet: { increment: bounty.amount } },
          create: { userId: message.author.id, guildId: message.guildId, wallet: bounty.amount, bank: 0 },
        }),
      ]);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.economy} Bounty Claimed`)
        .setColor(COLORS.success)
        .addFields([
          { name: 'Target', value: targetUser.tag, inline: true },
          { name: 'Bounty Claimed', value: `${bounty.amount} ${guild.currencySymbol || '💰'}`, inline: true },
          { name: 'Claimed By', value: message.author.tag, inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      await message.reply('❌ Failed to claim bounty.');
    }
  }
}

export default ClaimBountyCommand;
