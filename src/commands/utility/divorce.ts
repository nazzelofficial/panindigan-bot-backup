import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import {
  ChatInputCommandInteraction,
  Message,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class DivorceCommand extends BaseCommand {
  constructor() {
    super({
      name: 'divorce',
      description: 'Divorce your current spouse',
      category: 'utility',
      premiumTier: 'free',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: false, // social/divorce.ts handles slash
      prefixCommand: true,
      aliases: ['breakup', 'splitup'],
      examples: ['p!divorce'],
    } as CommandOptions);
  }

  private async handle(
    userId: string,
    guildId: string,
    send: (content: any) => Promise<any>,
  ): Promise<void> {
    const prisma = getPrismaClient();

    const couple = await prisma.couple.findFirst({
      where: {
        guildId,
        OR: [{ userId1: userId }, { userId2: userId }],
      },
    });

    if (!couple) {
      await send({
        content: `${EMOJIS.warning} You are not married to anyone.`,
        ephemeral: true,
      });
      return;
    }

    const spouseId = couple.userId1 === userId ? couple.userId2 : couple.userId1;
    const marriedAt = couple.marriedAt;
    const daysMarried = Math.floor((Date.now() - marriedAt.getTime()) / (1000 * 60 * 60 * 24));

    const confirmEmbed = new EmbedBuilder()
      .setTitle('💔 Divorce Confirmation')
      .setDescription(
        `Are you sure you want to divorce <@${spouseId}>?\n\n` +
        `You have been married for **${daysMarried}** day${daysMarried === 1 ? '' : 's'}.\n\n` +
        `⚠️ This action cannot be undone.`,
      )
      .setColor(COLORS.error)
      .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`divorce_confirm:${userId}`)
        .setLabel('💔 Yes, Divorce')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId(`divorce_cancel:${userId}`)
        .setLabel('💞 Cancel')
        .setStyle(ButtonStyle.Secondary),
    );

    const msg = await send({ embeds: [confirmEmbed], components: [row] });
    if (!msg) return;

    const collector = msg.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 30_000,
      filter: (i: any) => i.user.id === userId,
    });

    collector.on('collect', async (i: any) => {
      if (i.customId.startsWith('divorce_confirm')) {
        try {
          await prisma.couple.delete({ where: { id: couple.id } });

          // Clear spouse data
          await prisma.user.updateMany({
            where: { userId: { in: [userId, spouseId] }, guildId },
            data: { spouseId: null, marriedAt: null },
          });

          const divorcedEmbed = new EmbedBuilder()
            .setTitle('💔 Divorced')
            .setDescription(
              `You and <@${spouseId}> are no longer married.\n\n` +
              `*You were together for **${daysMarried}** day${daysMarried === 1 ? '' : 's'}.*`,
            )
            .setColor(COLORS.error)
            .setTimestamp();

          await i.update({ embeds: [divorcedEmbed], components: [] });
        } catch (err: any) {
          await i.update({
            content: `${EMOJIS.error} Failed to process divorce. Please try again.`,
            embeds: [],
            components: [],
          });
        }
      } else {
        const cancelledEmbed = new EmbedBuilder()
          .setDescription(`${EMOJIS.success} Divorce cancelled. You're still together! 💕`)
          .setColor(COLORS.success);
        await i.update({ embeds: [cancelledEmbed], components: [] });
      }
      collector.stop();
    });

    collector.on('end', async (collected: any) => {
      if (collected.size === 0) {
        try { await msg.edit({ components: [] }); } catch { /* ignored */ }
      }
    });
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await this.handle(interaction.user.id, interaction.guildId!, content => interaction.reply(content));
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    await this.handle(message.author.id, message.guildId!, content => message.reply(content));
  }
}

export default DivorceCommand;
