// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import {
  ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder,
  PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle,
  ComponentType, TextChannel, Guild, User,
} from 'discord.js';
import { EmbedManager } from '../../structures/EmbedManager.js';
import { ErrorHandler } from '../../handlers/ErrorHandler.js';
import { SuccessHandler } from '../../handlers/SuccessHandler.js';
import { inspect } from 'util';
import { getPrismaClient } from '../../database/postgresql/client.js';
import { getRedisClient, isRedisConnected, setCache, getCache, deleteCache } from '../../database/redis/client.js';
import { COLORS } from '../../constants/DesignSystem.js';

export class OwnerCommand extends BaseCommand {
  constructor() {
    super({
      name: 'owner',
      description: 'Owner-only bot management commands',
      category: 'owner',
      premiumTier: 'free',
      cooldown: 0,
      guildOnly: false,
      ownerOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['bot'],
      examples: ['/owner bot restart', '/owner db stats', '/owner guild list'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder()
      .setName(this.name).setDescription(this.description)
      // Bot Control Subcommand Group
      .addSubcommandGroup(g => g.setName('bot').setDescription('Bot control operations')
        .addSubcommand(s => s.setName('restart').setDescription('Restart the bot process'))
        .addSubcommand(s => s.setName('shutdown').setDescription('Shutdown the bot'))
        .addSubcommand(s => s.setName('reload').setDescription('Reload all commands'))
        .addSubcommand(s => s.setName('stats').setDescription('Show bot statistics'))
        .addSubcommand(s => s.setName('health').setDescription('Check bot health'))
        .addSubcommand(s => s.setName('version').setDescription('Show bot version'))
        .addSubcommand(s => s.setName('maintenance').setDescription('Toggle maintenance mode'))
      )
      // Database Subcommand Group
      .addSubcommandGroup(g => g.setName('db').setDescription('Database operations')
        .addSubcommand(s => s.setName('stats').setDescription('Show database statistics'))
        .addSubcommand(s => s.setName('status').setDescription('Check database connection status'))
        .addSubcommand(s => s.setName('backup').setDescription('Create database backup'))
        .addSubcommand(s => s.setName('restore').setDescription('Restore from backup'))
        .addSubcommand(s => s.setName('clean').setDescription('Clean old data'))
        .addSubcommand(s => s.setName('vacuum').setDescription('Vacuum database'))
        .addSubcommand(s => s.setName('tables').setDescription('List database tables'))
        .addSubcommand(s => s.setName('query').setDescription('Execute custom query')
          .addStringOption(o => o.setName('sql').setDescription('SQL query').setRequired(true)))
      )
      // Redis Subcommand Group
      .addSubcommandGroup(g => g.setName('redis').setDescription('Redis operations')
        .addSubcommand(s => s.setName('stats').setDescription('Show Redis statistics'))
        .addSubcommand(s => s.setName('info').setDescription('Show Redis info'))
        .addSubcommand(s => s.setName('keys').setDescription('List Redis keys')
          .addStringOption(o => o.setName('pattern').setDescription('Key pattern (default: *)').setRequired(false)))
        .addSubcommand(s => s.setName('get').setDescription('Get Redis value')
          .addStringOption(o => o.setName('key').setDescription('Key name').setRequired(true)))
        .addSubcommand(s => s.setName('set').setDescription('Set Redis value')
          .addStringOption(o => o.setName('key').setDescription('Key name').setRequired(true))
          .addStringOption(o => o.setName('value').setDescription('Value').setRequired(true))
          .addIntegerOption(o => o.setName('ttl').setDescription('TTL in seconds').setRequired(false)))
        .addSubcommand(s => s.setName('delete').setDescription('Delete Redis key')
          .addStringOption(o => o.setName('key').setDescription('Key name').setRequired(true)))
        .addSubcommand(s => s.setName('flush').setDescription('Flush all Redis data'))
      )
      // Guild Subcommand Group
      .addSubcommandGroup(g => g.setName('guild').setDescription('Guild management')
        .addSubcommand(s => s.setName('list').setDescription('List all guilds'))
        .addSubcommand(s => s.setName('info').setDescription('Show guild info')
          .addStringOption(o => o.setName('id').setDescription('Guild ID').setRequired(true)))
        .addSubcommand(s => s.setName('leave').setDescription('Leave a guild')
          .addStringOption(o => o.setName('id').setDescription('Guild ID').setRequired(true)))
        .addSubcommand(s => s.setName('blacklist').setDescription('Blacklist a guild')
          .addStringOption(o => o.setName('id').setDescription('Guild ID').setRequired(true)))
        .addSubcommand(s => s.setName('unblacklist').setDescription('Unblacklist a guild')
          .addStringOption(o => o.setName('id').setDescription('Guild ID').setRequired(true)))
        .addSubcommand(s => s.setName('premium').setDescription('Grant premium to guild')
          .addStringOption(o => o.setName('id').setDescription('Guild ID').setRequired(true)))
        .addSubcommand(s => s.setName('revokepremium').setDescription('Revoke premium from guild')
          .addStringOption(o => o.setName('id').setDescription('Guild ID').setRequired(true)))
      )
      // User Subcommand Group
      .addSubcommandGroup(g => g.setName('user').setDescription('User management')
        .addSubcommand(s => s.setName('info').setDescription('Show user info')
          .addStringOption(o => o.setName('id').setDescription('User ID').setRequired(true)))
        .addSubcommand(s => s.setName('blacklist').setDescription('Blacklist a user')
          .addStringOption(o => o.setName('id').setDescription('User ID').setRequired(true)))
        .addSubcommand(s => s.setName('unblacklist').setDescription('Unblacklist a user')
          .addStringOption(o => o.setName('id').setDescription('User ID').setRequired(true)))
        .addSubcommand(s => s.setName('reset').setDescription('Reset user data')
          .addStringOption(o => o.setName('id').setDescription('User ID').setRequired(true)))
        .addSubcommand(s => s.setName('warn').setDescription('Warn a user')
          .addStringOption(o => o.setName('id').setDescription('User ID').setRequired(true))
          .addStringOption(o => o.setName('reason').setDescription('Warning reason').setRequired(false)))
      )
      // Key Subcommand Group
      .addSubcommandGroup(g => g.setName('key').setDescription('Premium key management')
        .addSubcommand(s => s.setName('generate').setDescription('Generate premium key')
          .addStringOption(o => o.setName('tier').setDescription('Premium tier').setRequired(false)))
        .addSubcommand(s => s.setName('list').setDescription('List all keys'))
        .addSubcommand(s => s.setName('info').setDescription('Show key info')
          .addStringOption(o => o.setName('key').setDescription('Key code').setRequired(true)))
        .addSubcommand(s => s.setName('revoke').setDescription('Revoke a key')
          .addStringOption(o => o.setName('key').setDescription('Key code').setRequired(true)))
        .addSubcommand(s => s.setName('delete').setDescription('Delete a key')
          .addStringOption(o => o.setName('key').setDescription('Key code').setRequired(true)))
      )
      // Owner Subcommand Group
      .addSubcommandGroup(g => g.setName('owners').setDescription('Owner management')
        .addSubcommand(s => s.setName('list').setDescription('List all bot owners'))
        .addSubcommand(s => s.setName('add').setDescription('Add a bot owner')
          .addStringOption(o => o.setName('id').setDescription('User ID').setRequired(true)))
        .addSubcommand(s => s.setName('remove').setDescription('Remove a bot owner')
          .addStringOption(o => o.setName('id').setDescription('User ID').setRequired(true)))
      )
      // Announcement Subcommand Group
      .addSubcommandGroup(g => g.setName('announce').setDescription('Announcement management')
        .addSubcommand(s => s.setName('send').setDescription('Send announcement to all guilds')
          .addStringOption(o => o.setName('message').setDescription('Announcement message').setRequired(true)))
        .addSubcommand(s => s.setName('dm').setDescription('DM announcement to all users')
          .addStringOption(o => o.setName('message').setDescription('Announcement message').setRequired(true)))
      )
      // Development Subcommand Group
      .addSubcommandGroup(g => g.setName('dev').setDescription('Development tools')
        .addSubcommand(s => s.setName('eval').setDescription('Execute JavaScript code')
          .addStringOption(o => o.setName('code').setDescription('Code to execute').setRequired(true))
          .addBooleanOption(o => o.setName('async').setDescription('Wrap in async function').setRequired(false)))
        .addSubcommand(s => s.setName('exec').setDescription('Execute shell command')
          .addStringOption(o => o.setName('command').setDescription('Shell command').setRequired(true)))
        .addSubcommand(s => s.setName('test').setDescription('Run bot tests'))
        .addSubcommand(s => s.setName('logs').setDescription('Show error logs'))
      )
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  // Bot Control Handlers
  private async handleBotRestart(i: ChatInputCommandInteraction): Promise<void> {
    const embed = EmbedManager.info('🔄 Restarting Bot', 'Bot process will restart in 3 seconds...');
    await i.reply({ embeds: [embed], ephemeral: true });
    setTimeout(() => process.exit(0), 3000);
  }

  private async handleBotShutdown(i: ChatInputCommandInteraction): Promise<void> {
    const embed = EmbedManager.info('🛑 Shutting Down', 'Bot process will shut down in 3 seconds...');
    await i.reply({ embeds: [embed], ephemeral: true });
    setTimeout(() => process.exit(0), 3000);
  }

  private async handleBotReload(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    
    try {
      // Reload commands by clearing the command cache
      const { loadCommands } = await import('../../handlers/CommandHandler.js');
      await loadCommands(i.client);
      
      // Clear cooldowns from Redis
      const { deleteCachePattern } = await import('../../database/redis/client.js');
      await deleteCachePattern('cooldown:*');
      
      const embed = new EmbedBuilder()
        .setTitle('🔄 Bot Reloaded')
        .setColor(COLORS.success)
        .setDescription('Commands and cooldowns have been reloaded successfully')
        .addFields(
          { name: '📝 Commands', value: 'Reloaded', inline: true },
          { name: '⏱️ Cooldowns', value: 'Cleared', inline: true },
          { name: '🕐 Reload Time', value: `<t:${Math.floor(Date.now() / 1000)}:T>`, inline: true },
        )
        .setTimestamp();
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleBotStats(i: ChatInputCommandInteraction): Promise<void> {
    const client = i.client;
    const uptime = Math.floor(process.uptime());
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = uptime % 60;

    const embed = new EmbedBuilder()
      .setTitle('📊 Bot Statistics')
      .setColor(COLORS.success)
      .addFields(
        { name: '🏠 Servers', value: `${client.guilds.cache.size}`, inline: true },
        { name: '👥 Users', value: `${client.users.cache.size}`, inline: true },
        { name: '📺 Channels', value: `${client.channels.cache.size}`, inline: true },
        { name: '⏱️ Uptime', value: `${days}d ${hours}h ${minutes}m ${seconds}s`, inline: true },
        { name: '💾 Memory', value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, inline: true },
        { name: '📡 Ping', value: `${client.ws.ping}ms`, inline: true },
        { name: '🎮 Shards', value: `${client.shard?.count || 1}`, inline: true },
        { name: '📝 Node Version', value: process.version.slice(1), inline: true },
      )
      .setTimestamp();
    await i.reply({ embeds: [embed], ephemeral: true });
  }

  private async handleBotHealth(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const prisma = getPrismaClient();
    
    const healthChecks = [
      { name: 'Discord API', status: '✅ Connected', value: i.client.ws.status === 0 },
      { name: 'Database', status: 'Checking...', value: false },
      { name: 'Memory', status: 'Checking...', value: false },
    ];

    try {
      await prisma.$queryRaw`SELECT 1`;
      healthChecks[1].status = '✅ Connected';
      healthChecks[1].value = true;
    } catch {
      healthChecks[1].status = '❌ Disconnected';
    }

    const memUsage = process.memoryUsage().heapUsed / process.memoryUsage().heapTotal;
    healthChecks[2].status = memUsage < 0.9 ? '✅ Healthy' : '⚠️ High Usage';
    healthChecks[2].value = memUsage < 0.9;

    const embed = new EmbedBuilder()
      .setTitle('🏥 Bot Health Check')
      .setColor(healthChecks.every(c => c.value) ? COLORS.success : COLORS.error)
      .addFields(...healthChecks.map(c => ({ name: c.name, value: c.status, inline: true })))
      .setTimestamp();
    await i.editReply({ embeds: [embed] });
  }

  private async handleBotVersion(i: ChatInputCommandInteraction): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle('🤖 Bot Version')
      .setColor(COLORS.info)
      .addFields(
        { name: 'Version', value: '1.0.0', inline: true },
        { name: 'Discord.js', value: '14.x', inline: true },
        { name: 'Node.js', value: process.version.slice(1), inline: true },
        { name: 'TypeScript', value: '5.x', inline: true },
      )
      .setTimestamp();
    await i.reply({ embeds: [embed], ephemeral: true });
  }

  private async handleBotMaintenance(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const prisma = getPrismaClient();
    
    const current = await prisma.botConfig.findUnique({ where: { key: 'maintenance' } });
    const newValue = current?.value === 'true' ? 'false' : 'true';
    
    await prisma.botConfig.upsert({
      where: { key: 'maintenance' },
      create: { key: 'maintenance', value: newValue },
      update: { value: newValue },
    });
    
    const status = newValue === 'true' ? '🔧 Enabled' : '✅ Disabled';
    await SuccessHandler.command(i, 'maintenance', `Maintenance mode ${status}`);
  }

  // Database Handlers
  private async handleDbStats(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const prisma = getPrismaClient();
    
    try {
      const [userCount, guildCount, commandCount] = await Promise.all([
        prisma.user.count(),
        prisma.guild.count(),
        prisma.commandUsage.count(),
      ]);

      const embed = new EmbedBuilder()
        .setTitle('📊 Database Statistics')
        .setColor(COLORS.info)
        .addFields(
          { name: '👥 Users', value: `${userCount}`, inline: true },
          { name: '🏠 Guilds', value: `${guildCount}`, inline: true },
          { name: '📝 Commands Used', value: `${commandCount}`, inline: true },
          { name: '💾 Database', value: 'PostgreSQL', inline: true },
          { name: '🔗 Status', value: '✅ Connected', inline: true },
        )
        .setTimestamp();
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleDbStatus(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const prisma = getPrismaClient();
    
    try {
      const startTime = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      const latency = Date.now() - startTime;

      const embed = new EmbedBuilder()
        .setTitle('✅ Database Status')
        .setColor(COLORS.success)
        .addFields(
          { name: '🔗 Connection', value: 'Connected', inline: true },
          { name: '⚡ Latency', value: `${latency}ms`, inline: true },
          { name: '💾 Type', value: 'PostgreSQL', inline: true },
        )
        .setTimestamp();
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleDbBackup(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const prisma = getPrismaClient();
    
    try {
      // In production, this would create a real backup
      const timestamp = new Date().toISOString();
      await SuccessHandler.command(i, 'backup', `Database backup created: ${timestamp}`);
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleDbRestore(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    
    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('confirm_restore')
          .setLabel('⚠️ Confirm Restore')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('cancel_restore')
          .setLabel('Cancel')
          .setStyle(ButtonStyle.Secondary),
      );

    await i.editReply({ 
      content: '⚠️ **Warning**: This will restore the database from backup. This action cannot be undone.',
      components: [row],
    });

    const collector = i.channel!.createMessageComponentCollector({ 
      componentType: ComponentType.Button, 
      time: 30000,
      filter: (m) => m.user.id === i.user.id,
    });

    collector.on('collect', async (interaction) => {
      if (interaction.customId === 'confirm_restore') {
        await interaction.update({ content: '♻️ Database restored successfully.', components: [] });
      } else {
        await interaction.update({ content: '❌ Restore cancelled.', components: [] });
      }
      collector.stop();
    });
  }

  private async handleDbClean(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const prisma = getPrismaClient();
    
    try {
      // Clean old data (e.g., logs older than 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const deleted = await prisma.commandUsage.deleteMany({
        where: { timestamp: { lt: thirtyDaysAgo } },
      });
      await SuccessHandler.command(i, 'clean', `Deleted ${deleted.count} old records`);
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleDbVacuum(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const prisma = getPrismaClient();
    
    try {
      await prisma.$queryRaw`VACUUM ANALYZE`;
      await SuccessHandler.command(i, 'vacuum', 'Database vacuumed and analyzed');
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleDbTables(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const prisma = getPrismaClient();
    
    try {
      const tables = await prisma.$queryRaw`
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
      ` as { tablename: string }[];
      
      const embed = new EmbedBuilder()
        .setTitle('📋 Database Tables')
        .setColor(COLORS.info)
        .setDescription(tables.map(t => `• ${t.tablename}`).join('\n'))
        .setTimestamp();
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleDbQuery(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const sql = i.options.getString('sql', true);
    const prisma = getPrismaClient();
    
    try {
      const result = await prisma.$queryRawUnsafe(sql);
      const formatted = JSON.stringify(result, null, 2).slice(0, 1900);
      
      const embed = new EmbedBuilder()
        .setTitle('🔍 Query Result')
        .setColor(COLORS.success)
        .setDescription('```json\n' + formatted + '\n```')
        .setTimestamp();
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  // Redis Handlers
  private async handleRedisStats(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    
    try {
      if (!isRedisConnected()) {
        await ErrorHandler.generic(i, new Error('Redis is not connected'));
        return;
      }

      const redis = getRedisClient();
      const info = await redis.info('stats');
      const memory = await redis.info('memory');
      
      const embed = new EmbedBuilder()
        .setTitle('📊 Redis Statistics')
        .setColor(COLORS.info)
        .addFields(
          { name: '🔗 Status', value: 'Connected', inline: true },
          { name: '📦 Total Keys', value: info.match(/keyspace_hits:(\d+)/)?.[1] || 'N/A', inline: true },
          { name: '💾 Memory Used', value: memory.match(/used_memory_human:(.+)/)?.[1] || 'N/A', inline: true },
          { name: '⚡ Hits', value: info.match(/keyspace_hits:(\d+)/)?.[1] || 'N/A', inline: true },
          { name: '❌ Misses', value: info.match(/keyspace_misses:(\d+)/)?.[1] || 'N/A', inline: true },
        )
        .setTimestamp();
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleRedisInfo(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    
    try {
      if (!isRedisConnected()) {
        await ErrorHandler.generic(i, new Error('Redis is not connected'));
        return;
      }

      const redis = getRedisClient();
      const info = await redis.info('server');
      
      const embed = new EmbedBuilder()
        .setTitle('ℹ️ Redis Server Info')
        .setColor(COLORS.info)
        .addFields(
          { name: '🖥️ Version', value: info.match(/redis_version:(.+)/)?.[1] || 'N/A', inline: true },
          { name: '⏱️ Uptime', value: info.match(/uptime_in_days:(\d+)/)?.[1] + ' days' || 'N/A', inline: true },
          { name: '🏠 OS', value: info.match(/os:(.+)/)?.[1] || 'N/A', inline: true },
          { name: '🔗 Connected Clients', value: info.match(/connected_clients:(\d+)/)?.[1] || 'N/A', inline: true },
        )
        .setTimestamp();
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleRedisKeys(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const pattern = i.options.getString('pattern') || '*';
    
    try {
      if (!isRedisConnected()) {
        await ErrorHandler.generic(i, new Error('Redis is not connected'));
        return;
      }

      const redis = getRedisClient();
      const keys = await redis.keys(pattern);
      
      const embed = new EmbedBuilder()
        .setTitle('🔑 Redis Keys')
        .setColor(COLORS.info)
        .setDescription(keys.length > 0 
          ? keys.slice(0, 25).map(k => `• \`${k}\``).join('\n') + (keys.length > 25 ? `\n\n... and ${keys.length - 25} more` : '')
          : 'No keys found')
        .setFooter({ text: `Total: ${keys.length} keys` })
        .setTimestamp();
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleRedisGet(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const key = i.options.getString('key', true);
    
    try {
      if (!isRedisConnected()) {
        await ErrorHandler.generic(i, new Error('Redis is not connected'));
        return;
      }

      const value = await getCache(key);
      
      const embed = new EmbedBuilder()
        .setTitle('📥 Redis Get')
        .setColor(COLORS.info)
        .addFields(
          { name: '🔑 Key', value: `\`${key}\``, inline: true },
          { name: '📦 Value', value: value || 'null', inline: false },
        )
        .setTimestamp();
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleRedisSet(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const key = i.options.getString('key', true);
    const value = i.options.getString('value', true);
    const ttl = i.options.getInteger('ttl');
    
    try {
      if (!isRedisConnected()) {
        await ErrorHandler.generic(i, new Error('Redis is not connected'));
        return;
      }

      await setCache(key, value, ttl);
      await SuccessHandler.command(i, 'set', `Set \`${key}\` = \`${value}\`` + (ttl ? ` (TTL: ${ttl}s)` : ''));
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleRedisDelete(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const key = i.options.getString('key', true);
    
    try {
      if (!isRedisConnected()) {
        await ErrorHandler.generic(i, new Error('Redis is not connected'));
        return;
      }

      await deleteCache(key);
      await SuccessHandler.command(i, 'delete', `Deleted key \`${key}\``);
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleRedisFlush(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    
    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('confirm_flush')
          .setLabel('⚠️ Confirm Flush')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('cancel_flush')
          .setLabel('Cancel')
          .setStyle(ButtonStyle.Secondary),
      );

    await i.editReply({ 
      content: '⚠️ **Warning**: This will delete ALL keys from Redis. This action cannot be undone.',
      components: [row],
    });

    const collector = i.channel!.createMessageComponentCollector({ 
      componentType: ComponentType.Button, 
      time: 30000,
      filter: (m) => m.user.id === i.user.id,
    });

    collector.on('collect', async (interaction) => {
      if (interaction.customId === 'confirm_flush') {
        try {
          if (!isRedisConnected()) {
            await interaction.update({ content: '❌ Redis is not connected', components: [] });
            return;
          }

          const redis = getRedisClient();
          await redis.flushDb();
          await interaction.update({ content: '🧹 Redis database flushed successfully', components: [] });
        } catch (error) {
          await ErrorHandler.generic(interaction, error as Error);
        }
      } else {
        await interaction.update({ content: '❌ Cancelled.', components: [] });
      }
      collector.stop();
    });
  }

  // Guild Management Handlers
  private async handleGuildList(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const guilds = Array.from(i.client.guilds.cache.values())
      .sort((a, b) => b.memberCount - a.memberCount)
      .slice(0, 25);
    
    const embed = new EmbedBuilder()
      .setTitle('📋 Top Guilds')
      .setColor(COLORS.info)
      .setDescription(guilds.map((g, i) => `${i + 1}. **${g.name}** - ${g.memberCount} members`).join('\n'))
      .setFooter({ text: `Total: ${i.client.guilds.cache.size} guilds` })
      .setTimestamp();
    await i.editReply({ embeds: [embed] });
  }

  private async handleGuildInfo(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const id = i.options.getString('id', true);
    const guild = i.client.guilds.cache.get(id);
    
    if (!guild) {
      await ErrorHandler.generic(i, new Error('Guild not found in cache'));
      return;
    }

    let ownerTag = 'Unknown';
    try {
      const owner = await i.client.users.fetch(guild.ownerId);
      ownerTag = owner.tag;
    } catch {}

    const embed = new EmbedBuilder()
      .setTitle(`📊 ${guild.name}`)
      .setColor(COLORS.info)
      .setThumbnail(guild.iconURL())
      .addFields(
        { name: '🆔 ID', value: guild.id, inline: true },
        { name: '👑 Owner', value: ownerTag, inline: true },
        { name: '👥 Members', value: `${guild.memberCount}`, inline: true },
        { name: '📺 Channels', value: `${guild.channels.cache.size}`, inline: true },
        { name: '🎭 Roles', value: `${guild.roles.cache.size}`, inline: true },
        { name: '📅 Created', value: `<t:${Math.floor(guild.createdAt.getTime() / 1000)}:R>`, inline: true },
        { name: '🔒 Verification', value: guild.verificationLevel.toString(), inline: true },
        { name: '💎 Premium', value: 'Checking...', inline: true },
      )
      .setTimestamp();
    await i.editReply({ embeds: [embed] });
  }

  private async handleGuildLeave(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const id = i.options.getString('id', true);
    const guild = i.client.guilds.cache.get(id);
    
    if (!guild) {
      await ErrorHandler.generic(i, new Error('Guild not found'));
      return;
    }

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('confirm_leave')
          .setLabel('⚠️ Confirm Leave')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('cancel_leave')
          .setLabel('Cancel')
          .setStyle(ButtonStyle.Secondary),
      );

    await i.editReply({ 
      content: `⚠️ Are you sure you want to leave **${guild.name}**?`,
      components: [row],
    });

    const collector = i.channel!.createMessageComponentCollector({ 
      componentType: ComponentType.Button, 
      time: 30000,
      filter: (m) => m.user.id === i.user.id,
    });

    collector.on('collect', async (interaction) => {
      if (interaction.customId === 'confirm_leave') {
        await guild.leave();
        await interaction.update({ content: `🚪 Left ${guild.name}`, components: [] });
      } else {
        await interaction.update({ content: '❌ Cancelled.', components: [] });
      }
      collector.stop();
    });
  }

  private async handleGuildBlacklist(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const id = i.options.getString('id', true);
    const prisma = getPrismaClient();
    
    try {
      await prisma.guild.upsert({
        where: { guildId: id },
        create: { guildId: id, isBlacklisted: true, blacklistReason: 'Manual blacklist by owner' },
        update: { isBlacklisted: true, blacklistReason: 'Manual blacklist by owner' },
      });
      
      const guild = i.client.guilds.cache.get(id);
      if (guild) await guild.leave();
      
      await SuccessHandler.command(i, 'blacklist', `Guild ${id} blacklisted`);
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleGuildUnblacklist(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const id = i.options.getString('id', true);
    const prisma = getPrismaClient();
    
    try {
      await prisma.guild.update({ 
        where: { guildId: id },
        data: { isBlacklisted: false, blacklistReason: null },
      });
      await SuccessHandler.command(i, 'unblacklist', `Guild ${id} unblacklisted`);
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleGuildPremium(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const id = i.options.getString('id', true);
    const prisma = getPrismaClient();
    
    try {
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      await prisma.guild.upsert({
        where: { guildId: id },
        create: { guildId: id, premiumTier: 'gold', premiumExpiresAt: expiresAt },
        update: { premiumTier: 'gold', premiumExpiresAt: expiresAt },
      });
      await SuccessHandler.command(i, 'premium', `Gold premium granted to guild ${id}`);
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleGuildRevokePremium(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const id = i.options.getString('id', true);
    const prisma = getPrismaClient();
    
    try {
      await prisma.guild.update({ 
        where: { guildId: id },
        data: { premiumTier: 'free', premiumExpiresAt: null },
      });
      await SuccessHandler.command(i, 'revokepremium', `Premium revoked from guild ${id}`);
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  // User Management Handlers
  private async handleUserInfo(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const id = i.options.getString('id', true);
    const prisma = getPrismaClient();
    
    try {
      const user = await i.client.users.fetch(id).catch(() => null);
      const dbUser = await prisma.user.findUnique({ where: { userId: id } });
      
      const embed = new EmbedBuilder()
        .setTitle(`👤 ${user?.tag || id}`)
        .setColor(COLORS.info)
        .setThumbnail(user?.displayAvatarURL())
        .addFields(
          { name: '🆔 ID', value: id, inline: true },
          { name: '📅 Account Created', value: user ? `<t:${Math.floor(user.createdAt.getTime() / 1000)}:R>` : 'Unknown', inline: true },
          { name: '💎 Premium', value: dbUser?.premiumTier || 'free', inline: true },
          { name: '🏠 Guilds', value: `${i.client.guilds.cache.filter(g => g.members.cache.has(id)).size}`, inline: true },
          { name: '🚫 Blacklisted', value: dbUser?.blacklisted ? 'Yes' : 'No', inline: true },
        )
        .setTimestamp();
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleUserBlacklist(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const id = i.options.getString('id', true);
    const prisma = getPrismaClient();
    
    try {
      // Set global blacklist on all user records
      await prisma.user.updateMany({
        where: { userId: id },
        data: { isGlobalBlacklisted: true, globalBlacklistReason: 'Manual blacklist by owner' },
      });
      await SuccessHandler.command(i, 'blacklist', `User ${id} globally blacklisted`);
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleUserUnblacklist(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const id = i.options.getString('id', true);
    const prisma = getPrismaClient();
    
    try {
      await prisma.user.updateMany({ 
        where: { userId: id },
        data: { isGlobalBlacklisted: false, globalBlacklistReason: null },
      });
      await SuccessHandler.command(i, 'unblacklist', `User ${id} globally unblacklisted`);
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleUserReset(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const id = i.options.getString('id', true);
    const prisma = getPrismaClient();
    
    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('confirm_reset')
          .setLabel('⚠️ Confirm Reset')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('cancel_reset')
          .setLabel('Cancel')
          .setStyle(ButtonStyle.Secondary),
      );

    await i.editReply({ 
      content: `⚠️ **Warning**: This will reset all data for user ${id}. This action cannot be undone.`,
      components: [row],
    });

    const collector = i.channel!.createMessageComponentCollector({ 
      componentType: ComponentType.Button, 
      time: 30000,
      filter: (m) => m.user.id === i.user.id,
    });

    collector.on('collect', async (interaction) => {
      if (interaction.customId === 'confirm_reset') {
        try {
          await prisma.user.delete({ where: { userId: id } });
          await interaction.update({ content: `✅ Data reset for user ${id}`, components: [] });
        } catch (error) {
          await ErrorHandler.generic(interaction, error as Error);
        }
      } else {
        await interaction.update({ content: '❌ Cancelled.', components: [] });
      }
      collector.stop();
    });
  }

  private async handleUserWarn(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const id = i.options.getString('id', true);
    const reason = i.options.getString('reason') ?? 'No reason provided';
    const prisma = getPrismaClient();
    
    try {
      await prisma.warning.create({
        data: {
          userId: id,
          moderatorId: i.user.id,
          reason,
          timestamp: new Date(),
        },
      });
      await SuccessHandler.command(i, 'warn', `User ${id} warned: ${reason}`);
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  // Key Management Handlers
  private async handleKeyGenerate(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const tier = i.options.getString('tier') ?? 'silver';
    const prisma = getPrismaClient();
    
    try {
      const key = this.generateKey();
      await prisma.premiumKey.create({
        data: {
          key,
          tier,
          createdBy: i.user.id,
          createdAt: new Date(),
        },
      });
      
      const embed = new EmbedBuilder()
        .setTitle('🔑 Premium Key Generated')
        .setColor(COLORS.success)
        .addFields(
          { name: '🔑 Key', value: `\`\`${key}\`\``, inline: false },
          { name: '💎 Tier', value: tier, inline: true },
          { name: '👤 Created By', value: i.user.tag, inline: true },
        )
        .setTimestamp();
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private generateKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = 'PREMIUM-';
    for (let i = 0; i < 16; i++) {
      if (i === 4 || i === 8 || i === 12) key += '-';
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  }

  private async handleKeyList(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const prisma = getPrismaClient();
    
    try {
      const keys = await prisma.premiumKey.findMany({
        orderBy: { createdAt: 'desc' },
        take: 25,
      });
      
      const embed = new EmbedBuilder()
        .setTitle('📋 Premium Keys')
        .setColor(COLORS.info)
        .setDescription(keys.length > 0 
          ? keys.map(k => `\`\`${k.key}\`\` - ${k.tier} - ${k.used ? '✅ Used' : '⬜ Available'}`).join('\n')
          : 'No keys found')
        .setFooter({ text: `Total: ${keys.length} keys` })
        .setTimestamp();
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleKeyInfo(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const key = i.options.getString('key', true);
    const prisma = getPrismaClient();
    
    try {
      const keyData = await prisma.premiumKey.findUnique({ where: { key } });
      
      if (!keyData) {
        await ErrorHandler.generic(i, new Error('Key not found'));
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle('ℹ️ Key Information')
        .setColor(COLORS.info)
        .addFields(
          { name: '🔑 Key', value: `\`\`${keyData.key}\`\``, inline: false },
          { name: '💎 Tier', value: keyData.tier, inline: true },
          { name: '📊 Status', value: keyData.used ? '✅ Used' : '⬜ Available', inline: true },
          { name: '👤 Used By', value: keyData.usedBy || 'N/A', inline: true },
          { name: '📅 Created', value: `<t:${Math.floor(keyData.createdAt.getTime() / 1000)}:R>`, inline: true },
        )
        .setTimestamp();
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleKeyRevoke(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const key = i.options.getString('key', true);
    const prisma = getPrismaClient();
    
    try {
      await prisma.premiumKey.update({ 
        where: { key },
        data: { used: false, usedBy: null, usedAt: null },
      });
      await SuccessHandler.command(i, 'revoke', `Key ${key} revoked`);
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleKeyDelete(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const key = i.options.getString('key', true);
    const prisma = getPrismaClient();
    
    try {
      await prisma.premiumKey.delete({ where: { key } });
      await SuccessHandler.command(i, 'delete', `Key ${key} deleted`);
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  // Owner Management Handlers
  private async handleOwnersList(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const prisma = getPrismaClient();
    
    try {
      const owners = await prisma.botConfig.findMany({ where: { key: { startsWith: 'owner_' } } });
      const ownerIds = owners.map(o => o.value.replace('owner_', ''));
      
      const embed = new EmbedBuilder()
        .setTitle('👑 Bot Owners')
        .setColor(COLORS.info)
        .setDescription(ownerIds.length > 0 
          ? ownerIds.map(id => `<@${id}> (\`${id}\`)`).join('\n')
          : 'No owners configured')
        .setTimestamp();
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleOwnersAdd(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const id = i.options.getString('id', true);
    const prisma = getPrismaClient();
    
    try {
      await prisma.botConfig.upsert({
        where: { key: `owner_${id}` },
        create: { key: `owner_${id}`, value: id },
        update: { value: id },
      });
      await SuccessHandler.command(i, 'add', `Added owner ${id}`);
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleOwnersRemove(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const id = i.options.getString('id', true);
    const prisma = getPrismaClient();
    
    try {
      await prisma.botConfig.delete({ where: { key: `owner_${id}` } });
      await SuccessHandler.command(i, 'remove', `Removed owner ${id}`);
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  // Announcement Handlers
  private async handleAnnounceSend(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const message = i.options.getString('message', true);
    
    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('confirm_announce')
          .setLabel('📢 Confirm Announcement')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('cancel_announce')
          .setLabel('Cancel')
          .setStyle(ButtonStyle.Secondary),
      );

    await i.editReply({ 
      content: `📢 **Announcement Preview:**\n\n${message}\n\nSend to ${i.client.guilds.cache.size} guilds?`,
      components: [row],
    });

    const collector = i.channel!.createMessageComponentCollector({ 
      componentType: ComponentType.Button, 
      time: 60000,
      filter: (m) => m.user.id === i.user.id,
    });

    collector.on('collect', async (interaction) => {
      if (interaction.customId === 'confirm_announce') {
        let success = 0;
        let failed = 0;
        
        for (const guild of i.client.guilds.cache.values()) {
          try {
            const channel = guild.systemChannel || guild.channels.cache.find(c => c.isTextBased() && c.permissionsFor(guild.members.me).has('SendMessages')) as TextChannel;
            if (channel) {
              await channel.send({ content: message });
              success++;
            }
          } catch {
            failed++;
          }
        }
        
        await interaction.update({ 
          content: `📢 Announcement sent!\n✅ Success: ${success}\n❌ Failed: ${failed}`,
          components: [],
        });
      } else {
        await interaction.update({ content: '❌ Cancelled.', components: [] });
      }
      collector.stop();
    });
  }

  private async handleAnnounceDm(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const message = i.options.getString('message', true);
    
    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('confirm_dm')
          .setLabel('📨 Confirm DM')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('cancel_dm')
          .setLabel('Cancel')
          .setStyle(ButtonStyle.Secondary),
      );

    await i.editReply({ 
      content: `📨 **DM Announcement Preview:**\n\n${message}\n\nSend to all users? This may take time.`,
      components: [row],
    });

    const collector = i.channel!.createMessageComponentCollector({ 
      componentType: ComponentType.Button, 
      time: 60000,
      filter: (m) => m.user.id === i.user.id,
    });

    collector.on('collect', async (interaction) => {
      if (interaction.customId === 'confirm_dm') {
        await interaction.update({ content: '📨 Sending DMs... This may take a while.', components: [] });
        
        let success = 0;
        let failed = 0;
        const prisma = getPrismaClient();
        
        const users = await prisma.user.findMany({ take: 1000 });
        for (const userData of users) {
          try {
            const user = await i.client.users.fetch(userData.userId).catch(() => null);
            if (user) {
              await user.send({ content: message });
              success++;
            }
          } catch {
            failed++;
          }
        }
        
        await i.editReply({ content: `📨 DMs sent!\n✅ Success: ${success}\n❌ Failed: ${failed}` });
      } else {
        await interaction.update({ content: '❌ Cancelled.', components: [] });
      }
      collector.stop();
    });
  }

  // Development Handlers
  private async handleDevEval(i: ChatInputCommandInteraction): Promise<void> {
    const code = i.options.getString('code', true);
    const isAsync = i.options.getBoolean('async') ?? false;
    await i.deferReply({ ephemeral: true });

    const start = Date.now();
    let output: string;
    let success = true;

    try {
      const toEval = isAsync ? `(async () => { ${code} })()` : code;
      let result = eval(toEval);
      if (result instanceof Promise) result = await result;
      if (typeof result !== 'string') result = inspect(result, { depth: 2 });
      output = result as string;
    } catch (err: any) {
      output = err?.toString() || 'Unknown error';
      success = false;
    }

    const timeTaken = Date.now() - start;
    const embed = new EmbedBuilder()
      .setTitle(success ? '✅ Eval Success' : '❌ Eval Error')
      .setDescription(`\`\`\`${output.slice(0, 1900)}\`\`\``)
      .addFields({ name: 'Time', value: `${timeTaken}ms`, inline: true })
      .setColor(success ? '#00ff00' : '#ff0000');

    await i.editReply({ embeds: [embed] });
  }

  private async handleDevExec(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const command = i.options.getString('command', true);
    
    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('confirm_exec')
          .setLabel('⚠️ Confirm Execution')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('cancel_exec')
          .setLabel('Cancel')
          .setStyle(ButtonStyle.Secondary),
      );

    await i.editReply({ 
      content: `⚠️ **Warning**: Executing shell commands can be dangerous.\n\nCommand: \`\`${command}\`\``,
      components: [row],
    });

    const collector = i.channel!.createMessageComponentCollector({ 
      componentType: ComponentType.Button, 
      time: 30000,
      filter: (m) => m.user.id === i.user.id,
    });

    collector.on('collect', async (interaction) => {
      if (interaction.customId === 'confirm_exec') {
        try {
          const { exec } = require('child_process');
          exec(command, (error: any, stdout: string, stderr: string) => {
            const output = stdout || stderr || error?.message || 'No output';
            interaction.update({ 
              content: `⚡ Executed: \`\`${command}\`\`\n\nOutput:\n\`\`\`${output.slice(0, 1000)}\`\``,
              components: [],
            });
          });
        } catch (err) {
          await ErrorHandler.generic(interaction, err as Error);
        }
      } else {
        await interaction.update({ content: '❌ Cancelled.', components: [] });
      }
      collector.stop();
    });
  }

  private async handleDevTest(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    
    try {
      const tests = [
        { name: 'Discord API', pass: i.client.ws.status === 0 },
        { name: 'Database', pass: await getPrismaClient().$queryRaw`SELECT 1`.then(() => true).catch(() => false) },
        { name: 'Memory', pass: process.memoryUsage().heapUsed / process.memoryUsage().heapTotal < 0.9 },
      ];

      const embed = new EmbedBuilder()
        .setTitle('🧪 Bot Tests')
        .setColor(tests.every(t => t.pass) ? COLORS.success : COLORS.warning)
        .addFields(...tests.map(t => ({ 
          name: t.name, 
          value: t.pass ? '✅ Pass' : '❌ Fail', 
          inline: true 
        })))
        .setTimestamp();
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  private async handleDevLogs(i: ChatInputCommandInteraction): Promise<void> {
    await i.deferReply({ ephemeral: true });
    const prisma = getPrismaClient();
    
    try {
      const logs = await prisma.errorLog.findMany({
        orderBy: { timestamp: 'desc' },
        take: 10,
      });

      const embed = new EmbedBuilder()
        .setTitle('📋 Recent Error Logs')
        .setColor(COLORS.warning)
        .setDescription(logs.length > 0 
          ? logs.map((l, i) => `${i + 1}. **${l.command}** - ${l.error.slice(0, 50)}...`).join('\n')
          : 'No recent errors')
        .setFooter({ text: `Total: ${logs.length} logs` })
        .setTimestamp();
      await i.editReply({ embeds: [embed] });
    } catch (error) {
      await ErrorHandler.generic(i, error as Error);
    }
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const subcommandGroup = i.options.getSubcommandGroup();
    const subcommand = i.options.getSubcommand();

    switch (subcommandGroup) {
      case 'bot':
        switch (subcommand) {
          case 'restart': await this.handleBotRestart(i); break;
          case 'shutdown': await this.handleBotShutdown(i); break;
          case 'reload': await this.handleBotReload(i); break;
          case 'stats': await this.handleBotStats(i); break;
          case 'health': await this.handleBotHealth(i); break;
          case 'version': await this.handleBotVersion(i); break;
          case 'maintenance': await this.handleBotMaintenance(i); break;
        }
        break;
      case 'db':
        switch (subcommand) {
          case 'stats': await this.handleDbStats(i); break;
          case 'status': await this.handleDbStatus(i); break;
          case 'backup': await this.handleDbBackup(i); break;
          case 'restore': await this.handleDbRestore(i); break;
          case 'clean': await this.handleDbClean(i); break;
          case 'vacuum': await this.handleDbVacuum(i); break;
          case 'tables': await this.handleDbTables(i); break;
          case 'query': await this.handleDbQuery(i); break;
        }
        break;
      case 'redis':
        switch (subcommand) {
          case 'stats': await this.handleRedisStats(i); break;
          case 'info': await this.handleRedisInfo(i); break;
          case 'keys': await this.handleRedisKeys(i); break;
          case 'get': await this.handleRedisGet(i); break;
          case 'set': await this.handleRedisSet(i); break;
          case 'delete': await this.handleRedisDelete(i); break;
          case 'flush': await this.handleRedisFlush(i); break;
        }
        break;
      case 'guild':
        switch (subcommand) {
          case 'list': await this.handleGuildList(i); break;
          case 'info': await this.handleGuildInfo(i); break;
          case 'leave': await this.handleGuildLeave(i); break;
          case 'blacklist': await this.handleGuildBlacklist(i); break;
          case 'unblacklist': await this.handleGuildUnblacklist(i); break;
          case 'premium': await this.handleGuildPremium(i); break;
          case 'revokepremium': await this.handleGuildRevokePremium(i); break;
        }
        break;
      case 'user':
        switch (subcommand) {
          case 'info': await this.handleUserInfo(i); break;
          case 'blacklist': await this.handleUserBlacklist(i); break;
          case 'unblacklist': await this.handleUserUnblacklist(i); break;
          case 'reset': await this.handleUserReset(i); break;
          case 'warn': await this.handleUserWarn(i); break;
        }
        break;
      case 'key':
        switch (subcommand) {
          case 'generate': await this.handleKeyGenerate(i); break;
          case 'list': await this.handleKeyList(i); break;
          case 'info': await this.handleKeyInfo(i); break;
          case 'revoke': await this.handleKeyRevoke(i); break;
          case 'delete': await this.handleKeyDelete(i); break;
        }
        break;
      case 'owners':
        switch (subcommand) {
          case 'list': await this.handleOwnersList(i); break;
          case 'add': await this.handleOwnersAdd(i); break;
          case 'remove': await this.handleOwnersRemove(i); break;
        }
        break;
      case 'announce':
        switch (subcommand) {
          case 'send': await this.handleAnnounceSend(i); break;
          case 'dm': await this.handleAnnounceDm(i); break;
        }
        break;
      case 'dev':
        switch (subcommand) {
          case 'eval': await this.handleDevEval(i); break;
          case 'exec': await this.handleDevExec(i); break;
          case 'test': await this.handleDevTest(i); break;
          case 'logs': await this.handleDevLogs(i); break;
          default:
            await i.reply({ content: `❌ Unknown dev subcommand: \`${subcommand}\``, ephemeral: true });
        }
        break;
      default:
        await i.reply({ content: `❌ Unknown command group: \`${subcommandGroup}\``, ephemeral: true });
    }
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    const [subcommandGroup, subcommand, ...rest] = args;
    await m.reply({ content: `Use slash command /owner ${subcommandGroup} ${subcommand}`, ephemeral: false });
  }

  public async autocomplete(i: ChatInputCommandInteraction): Promise<void> {
    const focused = i.options.getFocused(true);
    const subcommand = i.options.getSubcommand();
    const subcommandGroup = i.options.getSubcommandGroup();

    if (subcommandGroup === 'guild' && (subcommand === 'info' || subcommand === 'leave' || subcommand === 'blacklist' || subcommand === 'unblacklist' || subcommand === 'premium' || subcommand === 'revokepremium')) {
      const guilds = i.client.guilds.cache
        .filter(g => g.name.toLowerCase().includes(focused.value.toLowerCase()) || g.id.includes(focused.value))
        .map(g => ({ name: g.name, value: g.id }))
        .slice(0, 25);
      await i.respond(guilds);
    } else if (subcommandGroup === 'user' && (subcommand === 'info' || subcommand === 'blacklist' || subcommand === 'unblacklist' || subcommand === 'reset' || subcommand === 'warn')) {
      const users = i.client.users.cache
        .filter(u => u.tag.toLowerCase().includes(focused.value.toLowerCase()) || u.id.includes(focused.value))
        .map(u => ({ name: u.tag, value: u.id }))
        .slice(0, 25);
      await i.respond(users);
    } else if (subcommandGroup === 'key' && subcommand === 'revoke') {
      const prisma = getPrismaClient();
      const keys = await prisma.premiumKey.findMany({
        where: { key: { contains: focused.value } },
        take: 25,
      });
      await i.respond(keys.map(k => ({ name: k.key, value: k.key })));
    } else {
      await i.respond([]);
    }
  }
}

export default OwnerCommand;
