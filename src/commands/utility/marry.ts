import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import {
  ChatInputCommandInteraction,
  Message,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  SlashCommandBuilder,
  User,
} from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

function coupleKey(id1: string, id2: string): [string, string] {
  return id1 < id2 ? [id1, id2] : [id2, id1];
}

export class MarryCommand extends BaseCommand {
  constructor() {
    super({
      name: 'marry',
      description: 'Propose marriage to another server member 💍',
      category: 'utility',
      premiumTier: 'free',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: false, // social/marry.ts registers the slash command
      prefixCommand: true,
      aliases: ['propose', 'weddingproposal'],
      examples: ['p!marry @user'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addUserOption(o =>
        o.setName('user').setDescription('The member you want to propose to').setRequired(true),
      )
      .setDMPermission(false) as SlashCommandBuilder;
  }

  private async handle(
    proposer: User,
    target: User,
    guildId: string,
    send: (content: any) => Promise<any>,
  ): Promise<void> {
    if (proposer.id === target.id) {
      await send({ content: `${EMOJIS.error} You cannot propose to yourself!`, ephemeral: true });
      return;
    }
    if (target.bot) {
      await send({ content: `${EMOJIS.error} You cannot marry a bot!`, ephemeral: true });
      return;
    }

    const prisma = getPrismaClient();

    // Check if proposer is already married
    const [p1, p2] = coupleKey(proposer.id, target.id);
    const existingMarriage = await prisma.couple.findFirst({
      where: {
        guildId,
        OR: [{ userId1: proposer.id }, { userId2: proposer.id }],
      },
    });

    if (existingMarriage) {
      const spouseId = existingMarriage.userId1 === proposer.id
        ? existingMarriage.userId2
        : existingMarriage.userId1;
      await send({
        content: `${EMOJIS.error} You are already married to <@${spouseId}>! Use \`p!divorce\` first.`,
        ephemeral: true,
      });
      return;
    }

    // Check if target is already married
    const targetMarriage = await prisma.couple.findFirst({
      where: {
        guildId,
        OR: [{ userId1: target.id }, { userId2: target.id }],
      },
    });

    if (targetMarriage) {
      await send({
        content: `${EMOJIS.error} **${target.username}** is already married!`,
        ephemeral: true,
      });
      return;
    }

    const proposalEmbed = new EmbedBuilder()
      .setTitle('💍 Marriage Proposal!')
      .setDescription(
        `${proposer} is getting down on one knee for ${target}! 💕\n\n` +
        `<@${target.id}>, will you accept this proposal?\n\n` +
        `*This request expires in 5 minutes.*`,
      )
      .setColor(COLORS.gold)
      .setThumbnail(proposer.displayAvatarURL({ size: 128 }))
      .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`marry_accept_util:${proposer.id}:${target.id}`)
        .setLabel('💍 Accept')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`marry_decline_util:${proposer.id}:${target.id}`)
        .setLabel('💔 Decline')
        .setStyle(ButtonStyle.Danger),
    );

    const msg = await send({ embeds: [proposalEmbed], components: [row] });
    if (!msg) return;

    const collector = msg.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 300_000,
      filter: (i: any) => i.user.id === target.id,
    });

    collector.on('collect', async (i: any) => {
      if (i.customId.startsWith('marry_accept_util')) {
        try {
          await prisma.couple.create({
            data: {
              userId1: p1,
              userId2: p2,
              guildId,
              marriedAt: new Date(),
              status: 'married',
            },
          });

          // Update User records
          await prisma.user.upsert({
            where: { userId_guildId: { userId: proposer.id, guildId } },
            create: { userId: proposer.id, guildId, spouseId: target.id, marriedAt: new Date() },
            update: { spouseId: target.id, marriedAt: new Date() },
          });
          await prisma.user.upsert({
            where: { userId_guildId: { userId: target.id, guildId } },
            create: { userId: target.id, guildId, spouseId: proposer.id, marriedAt: new Date() },
            update: { spouseId: proposer.id, marriedAt: new Date() },
          });

          const successEmbed = new EmbedBuilder()
            .setTitle('💒 Congratulations!')
            .setDescription(
              `🎊 ${proposer} and ${target} are now officially married! 💕\n\n` +
              `*May your love last forever!* 🌹`,
            )
            .setColor(0xff69b4)
            .setTimestamp();

          await i.update({ embeds: [successEmbed], components: [] });
        } catch (err: any) {
          await i.update({ content: `${EMOJIS.error} Failed to process marriage. Please try again.`, embeds: [], components: [] });
        }
      } else {
        const declineEmbed = new EmbedBuilder()
          .setDescription(`💔 ${target} has declined ${proposer}'s proposal.`)
          .setColor(COLORS.error);
        await i.update({ embeds: [declineEmbed], components: [] });
      }
      collector.stop();
    });

    collector.on('end', async (collected: any) => {
      if (collected.size === 0) {
        try {
          const expiredEmbed = new EmbedBuilder()
            .setDescription(`⌛ The proposal from ${proposer} to ${target} has expired.`)
            .setColor(COLORS.warning);
          await msg.edit({ embeds: [expiredEmbed], components: [] });
        } catch { /* message deleted */ }
      }
    });
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getUser('user', true);
    await this.handle(interaction.user, target, interaction.guildId!, content =>
      interaction.reply(content),
    );
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const target = message.mentions.users.first();
    if (!target) {
      return void message.reply(`${EMOJIS.error} Please mention the person you want to propose to!\nUsage: \`p!marry @user\``);
    }
    await this.handle(message.author, target, message.guildId!, content => message.reply(content));
  }
}

export default MarryCommand;
