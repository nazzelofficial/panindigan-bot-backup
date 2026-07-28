// @ts-nocheck
import {
  Interaction,
  ButtonInteraction,
  StringSelectMenuInteraction,
  ModalSubmitInteraction,
  ComponentType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { PanindiganClient } from '../structures/PanindiganClient.js';
import { coupleConsentService } from '../features/couple/CoupleConsentService.js';
import { coupleHistoryService } from '../features/couple/CoupleHistoryService.js';
import { getPrismaClient } from '../database/postgresql/client.js';
import { getCollection } from '../database/mongodb/client.js';
import { logger } from '../utils/Logger.js';
import { COLORS } from '../utils/Constants.js';

export async function handleComponent(interaction: Interaction, client: PanindiganClient): Promise<void> {
  if (interaction.isButton()) {
    await handleButton(interaction, client);
  } else if (interaction.isStringSelectMenu()) {
    await handleSelectMenu(interaction, client);
  } else if (interaction.isModalSubmit()) {
    await handleModal(interaction, client);
  }
}

async function handleButton(interaction: ButtonInteraction, client: PanindiganClient): Promise<void> {
  const { customId } = interaction;

  try {
    // Marriage buttons
    if (customId.startsWith('marry_accept:') || customId.startsWith('marry_decline:')) {
      await handleMarriageButton(interaction);
    }
    // Giveaway entry
    else if (customId.startsWith('giveaway_enter:')) {
      await handleGiveawayEntry(interaction);
    }
    // Music controls
    else if (customId.startsWith('music_')) {
      await handleMusicButton(interaction, client);
    }
    // Ticket controls
    else if (customId.startsWith('ticket_')) {
      await handleTicketButton(interaction, client);
    }
    // Pagination
    else if (customId.startsWith('paginator_') || customId.startsWith('page_')) {
      // Handled by per-command collectors
    }
    // Confirmation
    else if (customId.startsWith('confirm_') || customId.startsWith('cancel_')) {
      // Handled by per-command collectors
    }
    // Verification
    else if (customId.startsWith('verify_')) {
      await handleVerificationButton(interaction);
    }
    // Application buttons
    else if (customId.startsWith('application_')) {
      await handleApplicationButton(interaction);
    }
    // Starboard reaction tracking (handled by StarboardHandler)
    else if (customId.startsWith('starboard_')) {
      // no-op
    }
    // Help category buttons
    else if (customId.startsWith('help_')) {
      await handleHelpButton(interaction, client);
    }
  } catch (error) {
    logger.error('ComponentHandler button error', { customId, error: String(error) });
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: '❌ An error occurred processing this interaction.', ephemeral: true }).catch(() => {});
    }
  }
}

async function handleMarriageButton(interaction: ButtonInteraction): Promise<void> {
  const parts = interaction.customId.split(':');
  const action = parts[0]; // marry_accept or marry_decline
  const proposerId = parts[1];
  const targetId = parts[2];

  if (interaction.user.id !== targetId) {
    await interaction.reply({ content: '❌ Only the person being proposed to can respond.', ephemeral: true });
    return;
  }

  if (action === 'marry_accept') {
    const result = await coupleConsentService.acceptRequest(targetId, interaction.guildId!);
    if (!result.success) {
      await interaction.update({ content: `❌ ${result.error}`, components: [], embeds: [] });
      return;
    }
    await coupleHistoryService.recordMarriage(proposerId, targetId, interaction.guildId!);
    const embed = new EmbedBuilder()
      .setTitle('💒 Sila na!')
      .setDescription(`🎊 <@${proposerId}> at <@${targetId}> ay opisyal na isang couple!\n\n*Mahabang pagmamahal sa inyong dalawa!* 💕`)
      .setColor(0xff69b4).setTimestamp();
    await interaction.update({ embeds: [embed], components: [] });
  } else {
    await coupleConsentService.declineRequest(targetId, interaction.guildId!);
    const embed = new EmbedBuilder()
      .setDescription(`💔 <@${targetId}> ay tumanggi sa proposal ni <@${proposerId}>.`)
      .setColor(COLORS.error);
    await interaction.update({ embeds: [embed], components: [] });
  }
}

async function handleGiveawayEntry(interaction: ButtonInteraction): Promise<void> {
  const giveawayId = interaction.customId.replace('giveaway_enter:', '');
  const prisma = getPrismaClient();
  const userId = interaction.user.id;
  const guildId = interaction.guildId!;

  const giveaway = await prisma.giveaway.findFirst({
    where: { id: giveawayId, guildId, active: true },
  });

  if (!giveaway) {
    await interaction.reply({ content: '❌ This giveaway is no longer active.', ephemeral: true });
    return;
  }

  if (giveaway.endsAt < new Date()) {
    await interaction.reply({ content: '❌ This giveaway has already ended.', ephemeral: true });
    return;
  }

  const existingEntry = await prisma.giveawayEntry.findFirst({
    where: { giveawayId: giveaway.id, userId },
  });

  if (existingEntry) {
    await interaction.reply({ content: '✅ You are already entered in this giveaway!', ephemeral: true });
    return;
  }

  // Check role requirement
  if (giveaway.requiredRoleId) {
    const member = await interaction.guild?.members.fetch(userId).catch(() => null);
    if (!member?.roles.cache.has(giveaway.requiredRoleId)) {
      await interaction.reply({ content: `❌ You need the <@&${giveaway.requiredRoleId}> role to enter this giveaway.`, ephemeral: true });
      return;
    }
  }

  // Check level requirement
  if ((giveaway as any).requiredLevel) {
    const leveling = await prisma.leveling.findUnique({ where: { userId_guildId: { userId, guildId } } });
    if (!leveling || leveling.level < (giveaway as any).requiredLevel) {
      await interaction.reply({ content: `❌ You need to be level ${(giveaway as any).requiredLevel}+ to enter this giveaway.`, ephemeral: true });
      return;
    }
  }

  await prisma.giveawayEntry.create({ data: { giveawayId: giveaway.id, userId, guildId } });

  const entryCount = await prisma.giveawayEntry.count({ where: { giveawayId: giveaway.id } });

  await interaction.reply({
    content: `🎉 You've entered the giveaway for **${giveaway.prize}**!\n📊 Total entries: **${entryCount}**`,
    ephemeral: true,
  });
}

async function handleMusicButton(interaction: ButtonInteraction, client: PanindiganClient): Promise<void> {
  const parts = interaction.customId.split(':');
  const action = parts[0];
  const guildId = interaction.guildId!;

  if (!client.kazagumo) {
    await interaction.reply({ content: '❌ Music system unavailable.', ephemeral: true });
    return;
  }

  const player = client.kazagumo.players.get(guildId);
  if (!player) {
    await interaction.reply({ content: '❌ No active music player.', ephemeral: true });
    return;
  }

  await interaction.deferUpdate();

  switch (action) {
    case 'music_pause':
      if (player.paused) await player.pause(false);
      else await player.pause(true);
      break;
    case 'music_skip':
      await player.skip();
      break;
    case 'music_stop':
      await player.destroy();
      break;
    case 'music_shuffle':
      player.queue.shuffle();
      break;
    case 'music_loop':
      if (player.loop === 'none') await player.setLoop('track');
      else if (player.loop === 'track') await player.setLoop('queue');
      else await player.setLoop('none');
      break;
    case 'music_voldown': {
      const newVol = Math.max(0, (player.volume || 80) - 10);
      await player.setVolume(newVol);
      break;
    }
    case 'music_volup': {
      const newVol = Math.min(200, (player.volume || 80) + 10);
      await player.setVolume(newVol);
      break;
    }
  }
}

async function handleTicketButton(interaction: ButtonInteraction, client: PanindiganClient): Promise<void> {
  const action = interaction.customId.split(':')[0];
  const guildId = interaction.guildId!;
  const prisma = getPrismaClient();

  if (action === 'ticket_create') {
    const guild = await prisma.guild.findUnique({ where: { guildId } });
    if (!guild?.ticketCategoryId) {
      await interaction.reply({ content: '❌ Ticket system not configured.', ephemeral: true });
      return;
    }

    const existingChannel = interaction.guild?.channels.cache.find(
      ch => ch.name === `ticket-${interaction.user.username.toLowerCase()}`
    );
    if (existingChannel) {
      await interaction.reply({ content: `❌ You already have an open ticket: ${existingChannel}`, ephemeral: true });
      return;
    }

    const channel = await interaction.guild?.channels.create({
      name: `ticket-${interaction.user.username}`,
      parent: guild.ticketCategoryId,
      permissionOverwrites: [
        { id: interaction.guild!.id, deny: ['ViewChannel'] },
        { id: interaction.user.id, allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory'] },
        { id: interaction.guild!.me?.id || client.user!.id, allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'ManageChannels'] },
      ],
    });

    if (channel) {
      const embed = new EmbedBuilder()
        .setTitle('🎫 Support Ticket')
        .setDescription(`Hello <@${interaction.user.id}>! Support will be with you shortly.\n\nDescribe your issue and a staff member will help you.`)
        .setColor(COLORS.default)
        .setTimestamp();

      const closeRow = new (await import('discord.js')).ActionRowBuilder()
        .addComponents(
          new (await import('discord.js')).ButtonBuilder()
            .setCustomId('ticket_close')
            .setLabel('Close Ticket')
            .setStyle((await import('discord.js')).ButtonStyle.Danger)
            .setEmoji('🔒')
        );

      await channel.send({ content: `<@${interaction.user.id}>`, embeds: [embed], components: [closeRow as any] });
      await interaction.reply({ content: `✅ Your ticket has been created: ${channel}`, ephemeral: true });
    }
    return;
  }

  if (action === 'ticket_close') {
    if (!interaction.channel?.name.startsWith('ticket-')) {
      await interaction.reply({ content: '❌ This is not a ticket channel.', ephemeral: true });
      return;
    }
    const embed = new EmbedBuilder()
      .setDescription('🔒 This ticket will be closed in 5 seconds...')
      .setColor(COLORS.error);
    await interaction.reply({ embeds: [embed] });
    setTimeout(() => interaction.channel?.delete().catch(() => {}), 5000);
  }
}

async function handleVerificationButton(interaction: ButtonInteraction): Promise<void> {
  const guildId = interaction.guildId!;
  const prisma = getPrismaClient();
  const guild = await prisma.guild.findUnique({ where: { guildId } });

  if (!guild?.verificationRoleId) {
    await interaction.reply({ content: '❌ Verification role not configured.', ephemeral: true });
    return;
  }

  const member = await interaction.guild?.members.fetch(interaction.user.id).catch(() => null);
  if (!member) {
    await interaction.reply({ content: '❌ Could not find your member data.', ephemeral: true });
    return;
  }

  if (member.roles.cache.has(guild.verificationRoleId)) {
    await interaction.reply({ content: '✅ You are already verified!', ephemeral: true });
    return;
  }

  await member.roles.add(guild.verificationRoleId);
  await interaction.reply({ content: '✅ You have been verified! Welcome to the server.', ephemeral: true });
}

async function handleApplicationButton(interaction: ButtonInteraction): Promise<void> {
  // Application accept/deny buttons handled by application command collectors
  await interaction.reply({ content: '❌ Please use the application command to manage applications.', ephemeral: true });
}

const CATEGORY_EMOJIS: Record<string, string> = {
  moderation: '🛡️', admin: '👑', music: '🎵', economy: '💰', games: '🎮',
  fun: '🎉', ai: '🤖', info: 'ℹ️', utility: '🔧', social: '🌐',
  leveling: '📈', giveaway: '🎁', image: '🖼️', starboard: '⭐',
  applications: '📝', premium: '💎', owner: '🔑', help: 'ℹ️',
};

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function buildMainHelpEmbed(client: PanindiganClient): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle(`🤖 ${client.config.bot.name} v0.1 • All-in-One Discord Bot`)
    .setDescription(`Prefix: \`${client.config.bot.prefix}\` • ${client.commands.size} Commands • 18 Categories`)
    .setColor(0x5865f2)
    .addFields([
      { name: '🆓 Free', value: 'Essential commands — always available', inline: true },
      { name: '💎 Premium', value: 'Bronze→Diamond — feature-based tiers', inline: true },
      { name: '🔑 Owner', value: 'System-level control', inline: true },
    ])
    .setFooter({ text: 'Use the buttons below to browse command categories' });
}

function buildMainHelpRows(): ActionRowBuilder<ButtonBuilder>[] {
  const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('help_moderation').setLabel('🛡️ Mod').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('help_admin').setLabel('👑 Admin').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('help_music').setLabel('🎵 Music').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('help_economy').setLabel('💰 Economy').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('help_games').setLabel('🎮 Games').setStyle(ButtonStyle.Primary),
  );
  const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('help_fun').setLabel('🎉 Fun').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('help_ai').setLabel('🤖 AI').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('help_info').setLabel('ℹ️ Info').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('help_utility').setLabel('🔧 Utility').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('help_social').setLabel('🌐 Social').setStyle(ButtonStyle.Secondary),
  );
  const row3 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('help_leveling').setLabel('📈 Level').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('help_giveaway').setLabel('🎁 Giveaway').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('help_image').setLabel('🖼️ Image').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('help_starboard').setLabel('⭐ Starboard').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('help_applications').setLabel('📝 Apply').setStyle(ButtonStyle.Success),
  );
  const row4 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('help_premium').setLabel('💎 Premium').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('help_owner').setLabel('🔑 Owner').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId('help_main').setLabel('🏠 Home').setStyle(ButtonStyle.Secondary),
  );
  return [row1, row2, row3, row4];
}

async function handleHelpButton(interaction: ButtonInteraction, client: PanindiganClient): Promise<void> {
  const categoryOrAction = interaction.customId.replace('help_', '');

  if (categoryOrAction === 'main') {
    const embed = buildMainHelpEmbed(client);
    const rows = buildMainHelpRows();
    await interaction.update({ embeds: [embed], components: rows });
    return;
  }

  const category = categoryOrAction;
  const emoji = CATEGORY_EMOJIS[category] || '📌';

  // Collect unique commands for this category
  const seen = new Set<string>();
  const categoryCommands: string[] = [];
  for (const [key, cmd] of client.commands.entries()) {
    if (cmd.category !== category || key !== cmd.name || seen.has(cmd.name)) continue;
    seen.add(cmd.name);
    categoryCommands.push(`\`${cmd.name}\` — ${cmd.description}`);
  }

  const embed = new EmbedBuilder()
    .setTitle(`${emoji} ${capitalizeFirst(category)} Commands`)
    .setDescription(`**${categoryCommands.length}** commands in this category`)
    .setColor(0x5865f2);

  // Split into chunks of 1024 chars max per field
  const chunks: string[] = [];
  let current = '';
  for (const line of categoryCommands) {
    if (current.length + line.length + 1 > 1024) {
      chunks.push(current);
      current = line;
    } else {
      current += (current ? '\n' : '') + line;
    }
  }
  if (current) chunks.push(current);

  if (chunks.length === 0) {
    embed.addFields({ name: 'Commands', value: 'No commands found in this category.' });
  } else {
    for (let i = 0; i < Math.min(chunks.length, 5); i++) {
      embed.addFields({ name: i === 0 ? 'Commands' : '\u200b', value: chunks[i] });
    }
  }

  const backRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId('help_main').setLabel('🏠 Back to Main Menu').setStyle(ButtonStyle.Secondary),
  );

  await interaction.update({ embeds: [embed], components: [backRow] });
}

async function handleSelectMenu(interaction: StringSelectMenuInteraction, client: PanindiganClient): Promise<void> {
  const { customId } = interaction;

  try {
    if (customId.startsWith('help_category:')) {
      // Help menu category selection handled by command collector
    } else if (customId.startsWith('search_select:')) {
      // Music search selection handled by search command collector
    }
  } catch (error) {
    logger.error('ComponentHandler select error', { customId, error: String(error) });
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: '❌ An error occurred.', ephemeral: true }).catch(() => {});
    }
  }
}

async function handleModal(interaction: ModalSubmitInteraction, client: PanindiganClient): Promise<void> {
  const { customId } = interaction;

  try {
    if (customId.startsWith('tag_create_modal:')) {
      await handleTagCreateModal(interaction);
    } else if (customId.startsWith('report_modal:')) {
      await handleReportModal(interaction);
    }
  } catch (error) {
    logger.error('ComponentHandler modal error', { customId, error: String(error) });
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: '❌ An error occurred.', ephemeral: true }).catch(() => {});
    }
  }
}

async function handleTagCreateModal(interaction: ModalSubmitInteraction): Promise<void> {
  const name = interaction.fields.getTextInputValue('tag_name');
  const content = interaction.fields.getTextInputValue('tag_content');
  const guildId = interaction.guildId!;

  const collection = getCollection('server_tags');
  await collection.updateOne(
    { guildId, name },
    { $set: { guildId, name, content, createdBy: interaction.user.id, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
    { upsert: true }
  );

  await interaction.reply({ content: `✅ Tag **${name}** created/updated!`, ephemeral: true });
}

async function handleReportModal(interaction: ModalSubmitInteraction): Promise<void> {
  const reason = interaction.fields.getTextInputValue('report_reason');
  const targetId = interaction.customId.split(':')[1];
  const guildId = interaction.guildId!;
  const prisma = getPrismaClient();

  const guild = await prisma.guild.findUnique({ where: { guildId } });
  if (guild?.reportChannelId) {
    const channel = interaction.guild?.channels.cache.get(guild.reportChannelId);
    if (channel?.isTextBased()) {
      const embed = new EmbedBuilder()
        .setTitle('📢 New Report')
        .setColor(COLORS.warning)
        .addFields(
          { name: '🎯 Reported User', value: `<@${targetId}> (${targetId})`, inline: true },
          { name: '👤 Reporter', value: `<@${interaction.user.id}>`, inline: true },
          { name: '📝 Reason', value: reason, inline: false },
        )
        .setTimestamp();
      await channel.send({ embeds: [embed] });
    }
  }

  await interaction.reply({ content: '✅ Your report has been submitted. Thank you.', ephemeral: true });
}
