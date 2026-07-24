import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { getPrismaClient } from '../../database/postgresql/client';

export class AutoModCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'automod',
      description: 'Toggle auto-moderation features',
      category: 'moderation',
      cooldown: 3,
      userPermissions: [PermissionFlagsBits.ManageGuild],
      botPermissions: [PermissionFlagsBits.ManageMessages],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['automoderation', 'automodtoggle'],
      examples: ['/automod spam enable', 'p!automod caps disable'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const feature = interaction.options.getString('feature') || 'spam';
    const action = interaction.options.getString('action') || 'toggle';

    if (!interaction.guild) return;

    const prisma = getPrismaClient();
    const guild = await prisma.guild.findUnique({
      where: { guildId: interaction.guild.id },
    });

    const autoModConfig = guild?.autoModConfig || {
      spam: false,
      caps: false,
      mentions: false,
      links: false,
      invites: false,
    };

    let newState = autoModConfig[feature as keyof typeof autoModConfig];

    if (action === 'enable') {
      newState = true;
    } else if (action === 'disable') {
      newState = false;
    } else {
      newState = !newState;
    }

    autoModConfig[feature as keyof typeof autoModConfig] = newState;

    await prisma.guild.update({
      where: { guildId: interaction.guild.id },
      data: { autoModConfig },
    });

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.moderation} Auto-Mod Updated`)
      .setColor(newState ? COLORS.success : COLORS.warning)
      .addFields([
        { name: 'Feature', value: feature.toUpperCase(), inline: true },
        { name: 'Status', value: newState ? '✅ Enabled' : '❌ Disabled', inline: true },
        { name: 'Moderator', value: interaction.user.tag, inline: true },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const feature = args[0] || 'spam';
    const action = args[1] || 'toggle';

    if (!message.guild) return;

    const prisma = getPrismaClient();
    const guild = await prisma.guild.findUnique({
      where: { guildId: message.guild.id },
    });

    const autoModConfig = guild?.autoModConfig || {
      spam: false,
      caps: false,
      mentions: false,
      links: false,
      invites: false,
    };

    let newState = autoModConfig[feature as keyof typeof autoModConfig];

    if (action === 'enable' || action === 'on') {
      newState = true;
    } else if (action === 'disable' || action === 'off') {
      newState = false;
    } else {
      newState = !newState;
    }

    autoModConfig[feature as keyof typeof autoModConfig] = newState;

    await prisma.guild.update({
      where: { guildId: message.guild.id },
      data: { autoModConfig },
    });

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.moderation} Auto-Mod Updated`)
      .setColor(newState ? COLORS.success : COLORS.warning)
      .addFields([
        { name: 'Feature', value: feature.toUpperCase(), inline: true },
        { name: 'Status', value: newState ? '✅ Enabled' : '❌ Disabled', inline: true },
        { name: 'Moderator', value: message.author.tag, inline: true },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default AutoModCommand;
