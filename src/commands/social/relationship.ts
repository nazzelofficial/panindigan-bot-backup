// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import {
  ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder,
  ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType,
} from 'discord.js';
import { EmbedManager } from '../../structures/EmbedManager.js';
import { ErrorHandler } from '../../handlers/ErrorHandler.js';
import { SuccessHandler } from '../../handlers/SuccessHandler.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
import { COLORS } from '../../constants/DesignSystem.js';

export class RelationshipCommand extends BaseCommand {
  constructor() {
    super({
      name: 'relationship',
      description: 'Manage relationships and couples',
      category: 'social',
      premiumTier: 'free',
      cooldown: 5,
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['couple', 'marry', 'love'],
      examples: ['/relationship propose @user', '/relationship accept', '/relationship info'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder()
      .setName(this.name).setDescription(this.description)
      .addSubcommand(s => s.setName('propose').setDescription('Propose to someone')
        .addUserOption(o => o.setName('user').setDescription('User to propose to').setRequired(true)))
      .addSubcommand(s => s.setName('accept').setDescription('Accept a proposal'))
      .addSubcommand(s => s.setName('decline').setDescription('Decline a proposal'))
      .addSubcommand(s => s.setName('cancel').setDescription('Cancel your proposal'))
      .addSubcommand(s => s.setName('info').setDescription('View relationship info')
        .addUserOption(o => o.setName('user').setDescription('User to check').setRequired(false)))
      .addSubcommand(s => s.setName('divorce').setDescription('Divorce your partner'))
      .addSubcommand(s => s.setName('anniversary').setDescription('View anniversary info'))
      .addSubcommand(s => s.setName('goals').setDescription('Set relationship goals')
        .addStringOption(o => o.setName('goal').setDescription('Relationship goal').setRequired(false)))
      .addSubcommand(s => s.setName('nickname').setDescription('Set partner nickname')
        .addStringOption(o => o.setName('nickname').setDescription('Nickname').setRequired(false)))
      .addSubcommand(s => s.setName('message').setDescription('Send a message to your partner')
        .addStringOption(o => o.setName('message').setDescription('Message').setRequired(true)))
      .addSubcommand(s => s.setName('background').setDescription('Set relationship background')
        .addStringOption(o => o.setName('url').setDescription('Image URL').setRequired(false)))
      .addSubcommand(s => s.setName('card').setDescription('View relationship card'))
      .addSubcommand(s => s.setName('stats').setDescription('View relationship statistics'))
      .addSubcommand(s => s.setName('history').setDescription('View relationship history'))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const sub = i.options.getSubcommand();

    switch (sub) {
      case 'propose':
        await this.handlePropose(i);
        break;
      case 'accept':
        await this.handleAccept(i);
        break;
      case 'decline':
        await this.handleDecline(i);
        break;
      case 'cancel':
        await this.handleCancel(i);
        break;
      case 'info':
        await this.handleInfo(i);
        break;
      case 'divorce':
        await this.handleDivorce(i);
        break;
      case 'anniversary':
        await this.handleAnniversary(i);
        break;
      case 'goals':
        await this.handleGoals(i);
        break;
      case 'nickname':
        await this.handleNickname(i);
        break;
      case 'message':
        await this.handleMessage(i);
        break;
      case 'background':
        await this.handleBackground(i);
        break;
      case 'card':
        await this.handleCard(i);
        break;
      case 'stats':
        await this.handleStats(i);
        break;
      case 'history':
        await this.handleHistory(i);
        break;
    }
  }

  private async handlePropose(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const target = i.options.getUser('user', true);
    const prisma = getPrismaClient();
    
    if (target.id === i.user.id) {
      await ErrorHandler.generic(i, new Error('You cannot propose to yourself!'));
      return;
    }

    try {
      // Check if either user is already in a relationship
      const existing = await prisma.relationship.findFirst({
        where: {
          OR: [
            { user1Id: i.user.id },
            { user2Id: i.user.id },
            { user1Id: target.id },
            { user2Id: target.id },
          ],
          status: 'active',
        },
      });

      if (existing) {
        await ErrorHandler.generic(i, new Error('One of you is already in a relationship'));
        return;
      }

      // Create pending proposal
      await prisma.relationship.upsert({
        where: { id: `${i.user.id}-${target.id}` },
        create: {
          id: `${i.user.id}-${target.id}`,
          user1Id: i.user.id,
          user2Id: target.id,
          status: 'pending',
          proposedAt: new Date(),
        },
        update: {
          status: 'pending',
          proposedAt: new Date(),
        },
      });

      const embed = new EmbedBuilder()
        .setTitle('💕 Marriage Proposal')
        .setColor(COLORS.success)
        .setDescription(`${i.user} has proposed to ${target}!`)
        .addFields(
          { name: '💍 Status', value: 'Pending acceptance', inline: true },
          { name: '📅 Proposed', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
        )
        .setTimestamp();
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleAccept(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const prisma = getPrismaClient();
    
    try {
      const relationship = await prisma.relationship.findFirst({
        where: {
          user2Id: i.user.id,
          status: 'pending',
        },
      });

      if (!relationship) {
        await ErrorHandler.generic(i, new Error('No pending proposal found'));
        return;
      }

      await prisma.relationship.update({
        where: { id: relationship.id },
        data: {
          status: 'active',
          acceptedAt: new Date(),
        },
      });

      const embed = new EmbedBuilder()
        .setTitle('💍 Marriage Accepted')
        .setColor(COLORS.success)
        .setDescription(`${i.user} accepted the proposal!`)
        .addFields(
          { name: '💑 Status', value: 'Married', inline: true },
          { name: '📅 Married Since', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
        )
        .setTimestamp();
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleDecline(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const prisma = getPrismaClient();
    
    try {
      await prisma.relationship.deleteMany({
        where: {
          user2Id: i.user.id,
          status: 'pending',
        },
      });
      await SuccessHandler.command(i, 'decline', 'Proposal declined');
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleCancel(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const prisma = getPrismaClient();
    
    try {
      await prisma.relationship.deleteMany({
        where: {
          user1Id: i.user.id,
          status: 'pending',
        },
      });
      await SuccessHandler.command(i, 'cancel', 'Proposal cancelled');
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleInfo(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const target = i.options.getUser('user') || i.user;
    const prisma = getPrismaClient();
    
    try {
      const relationship = await prisma.relationship.findFirst({
        where: {
          OR: [
            { user1Id: target.id },
            { user2Id: target.id },
          ],
          status: 'active',
        },
      });

      if (!relationship) {
        await ErrorHandler.generic(i, new Error('No active relationship found'));
        return;
      }

      const partnerId = relationship.user1Id === target.id ? relationship.user2Id : relationship.user1Id;
      const partner = await i.client.users.fetch(partnerId).catch(() => null);

      const embed = new EmbedBuilder()
        .setTitle('💑 Relationship Info')
        .setColor(COLORS.info)
        .addFields(
          { name: '👤 Partner', value: partner?.tag || partnerId, inline: true },
          { name: '💍 Status', value: relationship.status, inline: true },
          { name: '📅 Since', value: relationship.acceptedAt ? `<t:${Math.floor(relationship.acceptedAt.getTime() / 1000)}:R>` : 'N/A', inline: true },
          { name: '💕 Nickname', value: relationship.nickname || 'None', inline: true },
        )
        .setTimestamp();
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleDivorce(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const prisma = getPrismaClient();
    
    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('confirm_divorce')
          .setLabel('💔 Confirm Divorce')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('cancel_divorce')
          .setLabel('Cancel')
          .setStyle(ButtonStyle.Secondary),
      );

    await i.editReply({ 
      content: '⚠️ **Warning**: This will end your marriage. This action cannot be undone.',
      components: [row],
    });

    const collector = i.channel!.createMessageComponentCollector({ 
      componentType: ComponentType.Button, 
      time: 30000,
      filter: (m) => m.user.id === i.user.id,
    });

    collector.on('collect', async (interaction) => {
      if (interaction.customId === 'confirm_divorce') {
        try {
          await prisma.relationship.deleteMany({
            where: {
              OR: [
                { user1Id: i.user.id },
                { user2Id: i.user.id },
              ],
              status: 'active',
            },
          });
          await interaction.update({ content: '💔 Divorce completed.', components: [] });
        } catch (error) {
          await ErrorHandler.generic(interaction, error as Error);
        }
      } else {
        await interaction.update({ content: '❌ Cancelled.', components: [] });
      }
      collector.stop();
    });
  }

  private async handleAnniversary(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const prisma = getPrismaClient();
    
    try {
      const relationship = await prisma.relationship.findFirst({
        where: {
          OR: [
            { user1Id: i.user.id },
            { user2Id: i.user.id },
          ],
          status: 'active',
        },
      });

      if (!relationship || !relationship.acceptedAt) {
        await ErrorHandler.generic(i, new Error('No active relationship found'));
        return;
      }

      const days = Math.floor((Date.now() - relationship.acceptedAt.getTime()) / (1000 * 60 * 60 * 24));
      const embed = new EmbedBuilder()
        .setTitle('🎉 Anniversary')
        .setColor(COLORS.success)
        .setDescription(`You've been married for **${days} days**!`)
        .addFields(
          { name: '📅 Marriage Date', value: `<t:${Math.floor(relationship.acceptedAt.getTime() / 1000)}:D>`, inline: true },
          { name: '🎊 Next Anniversary', value: `<t:${Math.floor(relationship.acceptedAt.getTime() / 1000) + 31536000}:R>`, inline: true },
        )
        .setTimestamp();
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleGoals(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const goal = i.options.getString('goal');
    const prisma = getPrismaClient();
    
    try {
      const relationship = await prisma.relationship.findFirst({
        where: {
          OR: [
            { user1Id: i.user.id },
            { user2Id: i.user.id },
          ],
          status: 'active',
        },
      });

      if (!relationship) {
        await ErrorHandler.generic(i, new Error('No active relationship found'));
        return;
      }

      if (goal) {
        await prisma.relationship.update({
          where: { id: relationship.id },
          data: { goals: goal },
        });
        await SuccessHandler.command(i, 'goals', `Relationship goal set: ${goal}`);
      } else {
        const embed = new EmbedBuilder()
          .setTitle('🎯 Relationship Goals')
          .setColor(COLORS.info)
          .setDescription(relationship.goals || 'No goals set yet')
          .setTimestamp();
        await i.editReply({ embeds: [embed] });
      }
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleNickname(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const nickname = i.options.getString('nickname');
    const prisma = getPrismaClient();
    
    try {
      const relationship = await prisma.relationship.findFirst({
        where: {
          OR: [
            { user1Id: i.user.id },
            { user2Id: i.user.id },
          ],
          status: 'active',
        },
      });

      if (!relationship) {
        await ErrorHandler.generic(i, new Error('No active relationship found'));
        return;
      }

      if (nickname) {
        await prisma.relationship.update({
          where: { id: relationship.id },
          data: { nickname },
        });
        await SuccessHandler.command(i, 'nickname', `Partner nickname set: ${nickname}`);
      } else {
        const embed = new EmbedBuilder()
          .setTitle('💕 Partner Nickname')
          .setColor(COLORS.info)
          .setDescription(relationship.nickname || 'No nickname set')
          .setTimestamp();
        await i.editReply({ embeds: [embed] });
      }
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleMessage(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const message = i.options.getString('message', true);
    const prisma = getPrismaClient();
    
    try {
      const relationship = await prisma.relationship.findFirst({
        where: {
          OR: [
            { user1Id: i.user.id },
            { user2Id: i.user.id },
          ],
          status: 'active',
        },
      });

      if (!relationship) {
        await ErrorHandler.generic(i, new Error('No active relationship found'));
        return;
      }

      const partnerId = relationship.user1Id === i.user.id ? relationship.user2Id : relationship.user1Id;
      const partner = await i.client.users.fetch(partnerId).catch(() => null);
      
      if (partner) {
        await partner.send({ content: `💕 Message from your partner: ${message}` });
        await SuccessHandler.command(i, 'message', 'Message sent to partner');
      } else {
        await ErrorHandler.generic(i, new Error('Partner not found'));
      }
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleBackground(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const url = i.options.getString('url');
    const prisma = getPrismaClient();
    
    try {
      const relationship = await prisma.relationship.findFirst({
        where: {
          OR: [
            { user1Id: i.user.id },
            { user2Id: i.user.id },
          ],
          status: 'active',
        },
      });

      if (!relationship) {
        await ErrorHandler.generic(i, new Error('No active relationship found'));
        return;
      }

      if (url) {
        await prisma.relationship.update({
          where: { id: relationship.id },
          data: { backgroundUrl: url },
        });
        await SuccessHandler.command(i, 'background', 'Relationship background set');
      } else {
        const embed = new EmbedBuilder()
          .setTitle('🖼️ Relationship Background')
          .setColor(COLORS.info)
          .setImage(relationship.backgroundUrl || null)
          .setDescription(relationship.backgroundUrl || 'No background set')
          .setTimestamp();
        await i.editReply({ embeds: [embed] });
      }
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleCard(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const prisma = getPrismaClient();
    
    try {
      const relationship = await prisma.relationship.findFirst({
        where: {
          OR: [
            { user1Id: i.user.id },
            { user2Id: i.user.id },
          ],
          status: 'active',
        },
      });

      if (!relationship) {
        await ErrorHandler.generic(i, new Error('No active relationship found'));
        return;
      }

      const partnerId = relationship.user1Id === i.user.id ? relationship.user2Id : relationship.user1Id;
      const partner = await i.client.users.fetch(partnerId).catch(() => null);
      const days = relationship.acceptedAt ? Math.floor((Date.now() - relationship.acceptedAt.getTime()) / (1000 * 60 * 60 * 24)) : 0;

      const embed = new EmbedBuilder()
        .setTitle('💑 Relationship Card')
        .setColor(COLORS.success)
        .setThumbnail(relationship.backgroundUrl || null)
        .addFields(
          { name: '👤 Partner', value: partner?.tag || partnerId, inline: true },
          { name: '💕 Nickname', value: relationship.nickname || 'None', inline: true },
          { name: '📅 Married For', value: `${days} days`, inline: true },
          { name: '🎯 Goals', value: relationship.goals || 'None', inline: false },
        )
        .setTimestamp();
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleStats(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const prisma = getPrismaClient();
    
    try {
      const relationship = await prisma.relationship.findFirst({
        where: {
          OR: [
            { user1Id: i.user.id },
            { user2Id: i.user.id },
          ],
          status: 'active',
        },
      });

      if (!relationship) {
        await ErrorHandler.generic(i, new Error('No active relationship found'));
        return;
      }

      const days = relationship.acceptedAt ? Math.floor((Date.now() - relationship.acceptedAt.getTime()) / (1000 * 60 * 60 * 24)) : 0;
      const messages = await prisma.relationshipMessage.count({ where: { relationshipId: relationship.id } });

      const embed = new EmbedBuilder()
        .setTitle('📊 Relationship Statistics')
        .setColor(COLORS.info)
        .addFields(
          { name: '💑 Status', value: relationship.status, inline: true },
          { name: '📅 Days Together', value: `${days}`, inline: true },
          { name: '💬 Messages', value: `${messages}`, inline: true },
          { name: '🎯 Goals Set', value: relationship.goals ? 'Yes' : 'No', inline: true },
          { name: '💕 Nickname', value: relationship.nickname || 'None', inline: true },
        )
        .setTimestamp();
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleHistory(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const prisma = getPrismaClient();
    
    try {
      const relationship = await prisma.relationship.findFirst({
        where: {
          OR: [
            { user1Id: i.user.id },
            { user2Id: i.user.id },
          ],
          status: 'active',
        },
      });

      if (!relationship) {
        await ErrorHandler.generic(i, new Error('No active relationship found'));
        return;
      }

      const history = await prisma.relationshipEvent.findMany({
        where: { relationshipId: relationship.id },
        orderBy: { timestamp: 'desc' },
        take: 10,
      });

      const embed = new EmbedBuilder()
        .setTitle('📜 Relationship History')
        .setColor(COLORS.info)
        .setDescription(history.length > 0 
          ? history.map(h => `• **${h.type}** - <t:${Math.floor(h.timestamp.getTime() / 1000)}:R>`).join('\n')
          : 'No history yet')
        .setTimestamp();
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    await m.reply({ content: 'Use slash command /relationship for full options.' });
  }
}

export default RelationshipCommand;
