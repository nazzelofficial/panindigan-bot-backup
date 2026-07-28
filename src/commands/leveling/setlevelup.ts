// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import {
  ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder,
  PermissionFlagsBits, TextChannel,
} from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class SetLevelUpCommand extends BaseCommand {
  constructor() {
    super({
      name: 'setlevelup',
      description: 'Configure level-up notification settings (Gold+)',
      category: 'leveling',
      premiumTier: 'gold',
      cooldown: 10,
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      userPermissions: [PermissionFlagsBits.ManageGuild],
      aliases: ['levelupconfig', 'setlvlup', 'levelnotify'],
      examples: [
        '/setlevelup channel #level-ups',
        '/setlevelup message Congrats {user}, you reached level {level}!',
        '/setlevelup disable',
        'p!setlevelup channel #level-ups',
      ],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addSubcommand(s => s.setName('channel')
        .setDescription('Set the channel where level-up notifications are sent')
        .addChannelOption(o => o.setName('channel').setDescription('The channel to send level-up notifications').setRequired(true)))
      .addSubcommand(s => s.setName('message')
        .setDescription('Set the custom level-up message')
        .addStringOption(o => o.setName('message').setDescription('Custom message — use {user}, {level}, {xp}').setRequired(true)))
      .addSubcommand(s => s.setName('disable').setDescription('Disable level-up notifications'))
      .addSubcommand(s => s.setName('status').setDescription('View current level-up notification settings'))
      .setDMPermission(false)
    ) as SlashCommandBuilder;
  }

  private async handleSub(sub: string, guildId: string, opts: { channel?: any; message?: string }): Promise<EmbedBuilder> {
    const prisma = getPrismaClient();

    if (sub === 'channel') {
      const ch = opts.channel as TextChannel;
      await prisma.guild.upsert({
        where: { guildId },
        create: { guildId, levelUpChannelId: ch.id },
        update: { levelUpChannelId: ch.id },
      });
      return new EmbedBuilder()
        .setTitle(`${EMOJIS.leveling} Level-Up Notifications`)
        .setColor(COLORS.success)
        .setDescription(`✅ Level-up notifications will now be sent to <#${ch.id}>.`)
        .setTimestamp();
    }

    if (sub === 'message') {
      const msg = opts.message!;
      await prisma.guild.upsert({
        where: { guildId },
        create: { guildId, levelUpMessage: msg },
        update: { levelUpMessage: msg },
      });
      return new EmbedBuilder()
        .setTitle(`${EMOJIS.leveling} Level-Up Message`)
        .setColor(COLORS.success)
        .addFields(
          { name: '✅ Message Set', value: msg, inline: false },
          { name: '📝 Variables', value: '`{user}` — mention\n`{level}` — new level\n`{xp}` — total XP\n`{username}` — display name', inline: false },
        )
        .setTimestamp();
    }

    if (sub === 'disable') {
      await prisma.guild.upsert({
        where: { guildId },
        create: { guildId, levelUpChannelId: null },
        update: { levelUpChannelId: null },
      });
      return new EmbedBuilder()
        .setTitle(`${EMOJIS.leveling} Level-Up Notifications`)
        .setColor(COLORS.warning)
        .setDescription('⚠️ Level-up notifications have been **disabled**.')
        .setTimestamp();
    }

    if (sub === 'status') {
      const guild = await prisma.guild.findUnique({ where: { guildId } });
      const chId = (guild as any)?.levelUpChannelId;
      const customMsg = (guild as any)?.levelUpMessage || 'Default: 🎉 {user} leveled up to **Level {level}**!';
      return new EmbedBuilder()
        .setTitle(`${EMOJIS.leveling} Level-Up Notification Status`)
        .setColor(COLORS.info)
        .addFields(
          { name: '📢 Channel', value: chId ? `<#${chId}>` : 'Not set (uses current channel)', inline: true },
          { name: '✅ Enabled', value: chId ? 'Yes' : 'Using default behavior', inline: true },
          { name: '💬 Message', value: customMsg, inline: false },
        )
        .setTimestamp();
    }

    return new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Unknown subcommand.');
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const sub = interaction.options.getSubcommand();
    await interaction.deferReply({ ephemeral: true });
    const embed = await this.handleSub(sub, interaction.guildId!, {
      channel: sub === 'channel' ? interaction.options.getChannel('channel', true) : undefined,
      message: sub === 'message' ? interaction.options.getString('message', true) : undefined,
    });
    await interaction.editReply({ embeds: [embed] });
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const sub = args[0]?.toLowerCase();
    if (!sub || !['channel', 'message', 'disable', 'status'].includes(sub)) {
      await message.reply(`${EMOJIS.error} Usage: \`p!setlevelup <channel|message|disable|status>\``);
      return;
    }
    const channel = sub === 'channel' ? (message.mentions.channels.first() || null) : undefined;
    const msg = sub === 'message' ? args.slice(1).join(' ') : undefined;
    const embed = await this.handleSub(sub, message.guildId!, { channel, message: msg });
    await message.reply({ embeds: [embed] });
  }
}

export default SetLevelUpCommand;
