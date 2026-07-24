import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import {
  ChatInputCommandInteraction,
  Message,
  EmbedBuilder,
  SlashCommandBuilder,
  User,
} from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

const REP_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

function formatCooldown(ms: number): string {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

async function giveRep(
  giverId: string,
  guildId: string,
  target: User,
  reply: (opts: any) => Promise<any>,
): Promise<void> {
  if (target.bot) {
    await reply({ content: `${EMOJIS.error} You cannot give reputation to bots.`, ephemeral: true });
    return;
  }
  if (target.id === giverId) {
    await reply({ content: `${EMOJIS.error} You cannot give reputation to yourself.`, ephemeral: true });
    return;
  }

  const prisma = getPrismaClient();

  // Check cooldown on the giver's record
  const giverRecord = await prisma.user.findUnique({
    where: { userId_guildId: { userId: giverId, guildId } },
    select: { lastRepGiven: true },
  });

  if (giverRecord?.lastRepGiven) {
    const elapsed = Date.now() - giverRecord.lastRepGiven.getTime();
    if (elapsed < REP_COOLDOWN_MS) {
      const remaining = REP_COOLDOWN_MS - elapsed;
      await reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`${EMOJIS.warning} Reputation Cooldown`)
            .setColor(COLORS.warning)
            .setDescription(
              `You can give reputation again in **${formatCooldown(remaining)}**.\n` +
              `You can only give one reputation point per 24 hours.`,
            ),
        ],
        ephemeral: true,
      });
      return;
    }
  }

  // Give rep — ensure target record exists
  const [, recipientRecord] = await Promise.all([
    prisma.user.upsert({
      where: { userId_guildId: { userId: giverId, guildId } },
      create: { userId: giverId, guildId, lastRepGiven: new Date() },
      update: { lastRepGiven: new Date() },
    }),
    prisma.user.upsert({
      where: { userId_guildId: { userId: target.id, guildId } },
      create: { userId: target.id, guildId, repPoints: 1 },
      update: { repPoints: { increment: 1 } },
    }),
  ]);

  const newRep = recipientRecord.repPoints;

  const embed = new EmbedBuilder()
    .setTitle(`${EMOJIS.success} ⭐ Reputation Given!`)
    .setColor(COLORS.success)
    .setThumbnail(target.displayAvatarURL({ size: 128 }))
    .setDescription(`<@${giverId}> gave a reputation point to **${target.username}**! ⭐`)
    .addFields(
      { name: '👤 Recipient', value: target.username, inline: true },
      { name: '⭐ Total Rep', value: `**${newRep}** point${newRep === 1 ? '' : 's'}`, inline: true },
      { name: '⏳ Next Rep', value: 'In **24 hours**', inline: true },
    )
    .setFooter({ text: 'You can give one reputation point per 24 hours.' })
    .setTimestamp();

  await reply({ embeds: [embed] });
}

async function viewRep(
  targetUser: User,
  guildId: string,
  reply: (opts: any) => Promise<any>,
): Promise<void> {
  const prisma = getPrismaClient();
  const userData = await prisma.user.findUnique({
    where: { userId_guildId: { userId: targetUser.id, guildId } },
    select: { repPoints: true },
  });

  const rep = userData?.repPoints ?? 0;

  // Get rank by rep in the guild
  const rank = await prisma.user.count({
    where: { guildId, repPoints: { gt: rep } },
  });

  const embed = new EmbedBuilder()
    .setTitle(`⭐ ${targetUser.username}'s Reputation`)
    .setColor(COLORS.gold)
    .setThumbnail(targetUser.displayAvatarURL({ size: 128 }))
    .addFields(
      { name: '⭐ Rep Points', value: `**${rep}** point${rep === 1 ? '' : 's'}`, inline: true },
      { name: '🏆 Server Rank', value: `**#${rank + 1}**`, inline: true },
    )
    .setTimestamp();

  await reply({ embeds: [embed] });
}

export class RepCommand extends BaseCommand {
  constructor() {
    super({
      name: 'rep',
      description: 'Give reputation to a user or view their reputation',
      category: 'utility',
      premiumTier: 'free',
      cooldown: 3,
      userPermissions: [],
      botPermissions: [],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['reputation', '+rep', 'giverep'],
      examples: ['/rep user:@someone', '/rep view user:@someone', 'p!rep @someone', 'p!rep view @someone'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addSubcommand(sub =>
        sub.setName('give')
          .setDescription('Give a reputation point to someone')
          .addUserOption(o =>
            o.setName('user').setDescription('User to give rep to').setRequired(true),
          ),
      )
      .addSubcommand(sub =>
        sub.setName('view')
          .setDescription("View a user's reputation")
          .addUserOption(o =>
            o.setName('user').setDescription('User to check (default: yourself)').setRequired(false),
          ),
      )
      .setDMPermission(false) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const sub = interaction.options.getSubcommand(false) || 'give';
    const guildId = interaction.guildId!;

    if (sub === 'view') {
      const target = interaction.options.getUser('user') || interaction.user;
      await interaction.deferReply();
      await viewRep(target, guildId, opts => interaction.editReply(opts));
    } else {
      const target = interaction.options.getUser('user', true);
      await interaction.deferReply();
      await giveRep(interaction.user.id, guildId, target, opts => interaction.editReply(opts));
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const guildId = message.guildId!;

    // p!rep view [@user]  OR  p!rep [@user]
    if (args[0]?.toLowerCase() === 'view') {
      const target = message.mentions.users.first() || message.author;
      await viewRep(target, guildId, opts => message.reply(opts));
      return;
    }

    const target = message.mentions.users.first();
    if (!target) {
      // If no mention, show own rep
      await viewRep(message.author, guildId, opts => message.reply(opts));
      return;
    }

    await giveRep(message.author.id, guildId, target, opts => message.reply(opts));
  }
}

export default RepCommand;
