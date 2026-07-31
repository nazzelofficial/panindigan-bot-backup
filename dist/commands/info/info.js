// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, } from 'discord.js';
import { EmbedManager } from '../../structures/EmbedManager.js';
import { ErrorHandler } from '../../handlers/ErrorHandler.js';
import { validationService } from '../../services/ValidationService.js';
export class InfoCommand extends BaseCommand {
    constructor() {
        super({
            name: 'info',
            description: 'Get information about users, servers, and more',
            category: 'info',
            premiumTier: 'free',
            cooldown: 3,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['information', 'details'],
            examples: ['/info user @user', '/info server', '/info bot'],
        });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder()
            .setName(this.name).setDescription(this.description)
            // User Information
            .addSubcommand(s => s.setName('user').setDescription('Get user information')
            .addUserOption(o => o.setName('user').setDescription('Target user').setRequired(false)))
            .addSubcommand(s => s.setName('avatar').setDescription('Get user avatar')
            .addUserOption(o => o.setName('user').setDescription('Target user').setRequired(false)))
            .addSubcommand(s => s.setName('banner').setDescription('Get user banner')
            .addUserOption(o => o.setName('user').setDescription('Target user').setRequired(false)))
            // Server Information
            .addSubcommand(s => s.setName('server').setDescription('Get server information'))
            .addSubcommand(s => s.setName('roles').setDescription('List server roles'))
            .addSubcommand(s => s.setName('channels').setDescription('List server channels'))
            .addSubcommand(s => s.setName('members').setDescription('List server members'))
            .addSubcommand(s => s.setName('bans').setDescription('List banned users'))
            .addSubcommand(s => s.setName('emojis').setDescription('List server emojis'))
            .addSubcommand(s => s.setName('roleinfo').setDescription('Get role information')
            .addRoleOption(o => o.setName('role').setDescription('Target role').setRequired(true)))
            .addSubcommand(s => s.setName('channelinfo').setDescription('Get channel information')
            .addChannelOption(o => o.setName('channel').setDescription('Target channel').setRequired(false)))
            // Bot Information
            .addSubcommand(s => s.setName('bot').setDescription('Get bot information'))
            .addSubcommand(s => s.setName('ping').setDescription('Check bot latency'))
            .addSubcommand(s => s.setName('uptime').setDescription('Get bot uptime'))
            .addSubcommand(s => s.setName('stats').setDescription('Get bot statistics'))
            // Utility Information
            .addSubcommand(s => s.setName('id').setDescription('Get ID from mention')
            .addStringOption(o => o.setName('mention').setDescription('User/role/channel mention').setRequired(true)))
            .addSubcommand(s => s.setName('snowflake').setDescription('Get timestamp from snowflake')
            .addStringOption(o => o.setName('snowflake').setDescription('Snowflake ID').setRequired(true)))
            .addSubcommand(s => s.setName('permissions').setDescription('Check permissions')
            .addUserOption(o => o.setName('user').setDescription('Target user').setRequired(false)))
            .addSubcommand(s => s.setName('emojiinfo').setDescription('Get emoji information')
            .addStringOption(o => o.setName('emoji').setDescription('Emoji').setRequired(true)))
            // External Information
            .addSubcommand(s => s.setName('weather').setDescription('Get weather information')
            .addStringOption(o => o.setName('location').setDescription('Location').setRequired(true)))
            .addSubcommand(s => s.setName('time').setDescription('Get time in different timezones')
            .addStringOption(o => o.setName('timezone').setDescription('Timezone').setRequired(false)))
            .addSubcommand(s => s.setName('wikipedia').setDescription('Search Wikipedia')
            .addStringOption(o => o.setName('query').setDescription('Search query').setRequired(true)))
            .addSubcommand(s => s.setName('urban').setDescription('Search Urban Dictionary')
            .addStringOption(o => o.setName('term').setDescription('Search term').setRequired(true)))
            .addSubcommand(s => s.setName('github').setDescription('Get GitHub user info')
            .addStringOption(o => o.setName('username').setDescription('GitHub username').setRequired(true)))
            .addSubcommand(s => s.setName('country').setDescription('Get country information')
            .addStringOption(o => o.setName('country').setDescription('Country name').setRequired(true))));
    }
    async executeSlash(i) {
        const subcommand = i.options.getSubcommand();
        const validation = await validationService.validateInteraction(i, {
            checkBlacklist: true,
        });
        if (!validation.valid) {
            await ErrorHandler.generic(i, new Error(validation.error));
            return;
        }
        switch (subcommand) {
            case 'user':
                await this.handleUser(i);
                break;
            case 'avatar':
                await this.handleAvatar(i);
                break;
            case 'banner':
                await this.handleBanner(i);
                break;
            case 'server':
                await this.handleServer(i);
                break;
            case 'roles':
                await this.handleRoles(i);
                break;
            case 'channels':
                await this.handleChannels(i);
                break;
            case 'members':
                await this.handleMembers(i);
                break;
            case 'bans':
                await this.handleBans(i);
                break;
            case 'emojis':
                await this.handleEmojis(i);
                break;
            case 'roleinfo':
                await this.handleRoleInfo(i);
                break;
            case 'channelinfo':
                await this.handleChannelInfo(i);
                break;
            case 'bot':
                await this.handleBot(i);
                break;
            case 'ping':
                await this.handlePing(i);
                break;
            case 'uptime':
                await this.handleUptime(i);
                break;
            case 'stats':
                await this.handleStats(i);
                break;
            case 'id':
                await this.handleId(i);
                break;
            case 'snowflake':
                await this.handleSnowflake(i);
                break;
            case 'permissions':
                await this.handlePermissions(i);
                break;
            case 'emojiinfo':
                await this.handleEmojiInfo(i);
                break;
            case 'weather':
                await this.handleWeather(i);
                break;
            case 'time':
                await this.handleTime(i);
                break;
            case 'wikipedia':
                await this.handleWikipedia(i);
                break;
            case 'urban':
                await this.handleUrban(i);
                break;
            case 'github':
                await this.handleGithub(i);
                break;
            case 'country':
                await this.handleCountry(i);
                break;
            default:
                await ErrorHandler.send(i, { title: 'Unknown Subcommand', description: `\`${subcommand}\` is not a recognized subcommand.`, ephemeral: true });
        }
    }
    async handleUser(i) {
        await i.deferReply();
        const user = i.options.getUser('user') || i.user;
        const member = i.guild?.members.cache.get(user.id);
        const fields = [
            { name: '👤 Username', value: user.tag, inline: true },
            { name: '🆔 ID', value: `\`${user.id}\``, inline: true },
            { name: '📅 Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
        ];
        if (member) {
            const topRoles = member.roles.cache
                .filter(r => r.id !== i.guild.id)
                .sort((a, b) => b.position - a.position)
                .first(5)
                .map(r => r.toString())
                .join(' ') || 'None';
            fields.push({ name: '🎭 Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true }, { name: '🔝 Highest Role', value: member.roles.highest.toString(), inline: true }, { name: '🎨 Top Roles', value: topRoles, inline: false });
        }
        const isBotUser = user.bot;
        if (isBotUser) {
            fields.push({ name: '🤖 Account Type', value: 'Bot', inline: true });
        }
        const embed = EmbedManager.info('User Information', `**${user.tag}**`)
            .setThumbnail(user.displayAvatarURL({ size: 512 }))
            .addFields(...fields);
        // Quick-action link buttons
        const row = new ActionRowBuilder().addComponents(new ButtonBuilder()
            .setLabel('View Avatar')
            .setStyle(ButtonStyle.Link)
            .setURL(user.displayAvatarURL({ size: 4096 }))
            .setEmoji('🖼️'));
        await i.editReply({ embeds: [embed], components: [row] });
    }
    async handleAvatar(i) {
        await i.deferReply();
        const user = i.options.getUser('user') || i.user;
        const embed = EmbedManager.info('User Avatar', `**${user.tag}**'s avatar`)
            .setImage(user.displayAvatarURL({ size: 4096 }));
        await i.editReply({ embeds: [embed] });
    }
    async handleBanner(i) {
        await i.deferReply();
        // Fetch the user with full profile data (needed for banner)
        const user = await (i.options.getUser('user') || i.user).fetch();
        const bannerUrl = user.bannerURL({ size: 4096 });
        if (!bannerUrl) {
            const embed = EmbedManager.info('No Banner', `**${user.tag}** doesn't have a profile banner.`)
                .addFields({
                name: '💡 Did you know?',
                value: 'Users need **Discord Nitro** to set a custom animated profile banner.',
                inline: false,
            });
            const row = new ActionRowBuilder().addComponents(new ButtonBuilder()
                .setLabel('View Avatar Instead')
                .setStyle(ButtonStyle.Link)
                .setURL(user.displayAvatarURL({ size: 4096 }))
                .setEmoji('🖼️'));
            await i.editReply({ embeds: [embed], components: [row] });
            return;
        }
        const embed = EmbedManager.info('User Banner', `**${user.tag}**'s banner`).setImage(bannerUrl);
        const row = new ActionRowBuilder().addComponents(new ButtonBuilder()
            .setLabel('Open Full Size')
            .setStyle(ButtonStyle.Link)
            .setURL(bannerUrl)
            .setEmoji('🔍'));
        await i.editReply({ embeds: [embed], components: [row] });
    }
    async handleServer(i) {
        await i.deferReply();
        if (!i.guild)
            return;
        const guild = i.guild;
        const embed = EmbedManager.info('Server Information', `**${guild.name}**`)
            .addFields({ name: '👑 Owner', value: `<@${guild.ownerId}>`, inline: true }, { name: '👥 Members', value: `${guild.memberCount}`, inline: true }, { name: '📅 Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true }, { name: '🎨 Roles', value: `${guild.roles.cache.size}`, inline: true }, { name: '📺 Channels', value: `${guild.channels.cache.size}`, inline: true }, { name: '😀 Emojis', value: `${guild.emojis.cache.size}`, inline: true }, { name: '🚀 Boosts', value: `${guild.premiumSubscriptionCount || 0} (Level ${guild.premiumTier})`, inline: true }, { name: '🔒 Verification', value: guild.verificationLevel.toString(), inline: true })
            .setThumbnail(guild.iconURL({ size: 4096 }));
        await i.editReply({ embeds: [embed] });
    }
    async handleRoles(i) {
        await i.deferReply();
        if (!i.guild)
            return;
        const roles = i.guild.roles.cache
            .sort((a, b) => b.position - a.position)
            .map(r => r.name)
            .slice(0, 25)
            .join(', ');
        const embed = EmbedManager.info('Server Roles', `Total roles: ${i.guild.roles.cache.size}`)
            .setDescription(roles || 'No roles')
            .setFooter({ text: 'Showing top 25 roles by position' });
        await i.editReply({ embeds: [embed] });
    }
    async handleChannels(i) {
        await i.deferReply();
        if (!i.guild)
            return;
        const channels = i.guild.channels.cache;
        const textChannels = channels.filter(c => c.isTextBased()).size;
        const voiceChannels = channels.filter(c => c.isVoiceBased()).size;
        const categories = channels.filter(c => c.isCategory()).size;
        const embed = EmbedManager.info('Server Channels', `Total channels: ${channels.size}`)
            .addFields({ name: '💬 Text', value: `${textChannels}`, inline: true }, { name: '🔊 Voice', value: `${voiceChannels}`, inline: true }, { name: '📁 Categories', value: `${categories}`, inline: true });
        await i.editReply({ embeds: [embed] });
    }
    async handleMembers(i) {
        await i.deferReply();
        if (!i.guild)
            return;
        const members = i.guild.members.cache;
        const online = members.filter(m => m.presence?.status === 'online').size;
        const idle = members.filter(m => m.presence?.status === 'idle').size;
        const dnd = members.filter(m => m.presence?.status === 'dnd').size;
        const offline = members.filter(m => !m.presence || m.presence.status === 'offline').size;
        const bots = members.filter(m => m.user.bot).size;
        const humans = members.filter(m => !m.user.bot).size;
        const embed = EmbedManager.info('Server Members', `Total members: ${i.guild.memberCount}`)
            .addFields({ name: '🟢 Online', value: `${online}`, inline: true }, { name: '🌙 Idle', value: `${idle}`, inline: true }, { name: '🔴 DND', value: `${dnd}`, inline: true }, { name: '⚫ Offline', value: `${offline}`, inline: true }, { name: '🤖 Bots', value: `${bots}`, inline: true }, { name: '👤 Humans', value: `${humans}`, inline: true });
        await i.editReply({ embeds: [embed] });
    }
    async handleBans(i) {
        await i.deferReply();
        if (!i.guild)
            return;
        const bans = await i.guild.bans.fetch();
        const embed = EmbedManager.info('Banned Users', `Total bans: ${bans.size}`);
        await i.editReply({ embeds: [embed] });
    }
    async handleEmojis(i) {
        await i.deferReply();
        if (!i.guild)
            return;
        const emojis = i.guild.emojis.cache;
        const animated = emojis.filter(e => e.animated).size;
        const staticEmojis = emojis.filter(e => !e.animated).size;
        const emojiList = emojis.map(e => e.toString()).join(' ').slice(0, 2000);
        const embed = EmbedManager.info('Server Emojis', `Total emojis: ${emojis.size}`)
            .addFields({ name: '🎬 Animated', value: `${animated}`, inline: true }, { name: '🖼️ Static', value: `${staticEmojis}`, inline: true })
            .setDescription(emojiList || 'No emojis');
        await i.editReply({ embeds: [embed] });
    }
    async handleRoleInfo(i) {
        await i.deferReply();
        const role = i.options.getRole('role', true);
        const permissions = role.permissions.toArray().slice(0, 10).map(p => p.replace(/_/g, ' ')).join(', ');
        const embed = EmbedManager.info('Role Information', `**${role.name}**`)
            .addFields({ name: '🆔 ID', value: role.id, inline: true }, { name: '🎨 Color', value: role.hexColor || 'Default', inline: true }, { name: '📊 Position', value: role.position.toString(), inline: true }, { name: '👥 Members', value: `${role.members.size}`, inline: true }, { name: '🔑 Permissions', value: permissions || 'None', inline: false }, { name: '📅 Created', value: `<t:${Math.floor(role.createdTimestamp / 1000)}:R>`, inline: true }, { name: '🔗 Mentionable', value: role.mentionable ? 'Yes' : 'No', inline: true }, { name: '🔒 Hoisted', value: role.hoist ? 'Yes' : 'No', inline: true });
        await i.editReply({ embeds: [embed] });
    }
    async handleChannelInfo(i) {
        await i.deferReply();
        const channel = i.options.getChannel('channel') || i.channel;
        if (!channel)
            return;
        const fields = [
            { name: '🆔 ID', value: channel.id, inline: true },
            { name: '📝 Name', value: channel.name, inline: true },
            { name: '📅 Created', value: `<t:${Math.floor(channel.createdTimestamp / 1000)}:R>`, inline: true },
            { name: '📊 Type', value: channel.type.toString(), inline: true },
        ];
        if (channel.isTextBased()) {
            fields.push({ name: '🔒 NSFW', value: channel.nsfw ? 'Yes' : 'No', inline: true }, { name: '📌 Position', value: channel.position.toString(), inline: true });
        }
        if (channel.isVoiceBased()) {
            fields.push({ name: '👥 Connected', value: `${channel.members.size}`, inline: true }, { name: '🔊 Bitrate', value: `${channel.bitrate}kbps`, inline: true });
        }
        const embed = EmbedManager.info('Channel Information', `**${channel.name}**`).addFields(...fields);
        await i.editReply({ embeds: [embed] });
    }
    async handleBot(i) {
        await i.deferReply();
        const client = i.client;
        const totalMembers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        const totalChannels = client.guilds.cache.reduce((acc, guild) => acc + guild.channels.cache.size, 0);
        const embed = EmbedManager.info('Bot Information', `**${client.user?.tag}**`)
            .addFields({ name: '🖥️ Servers', value: `${client.guilds.cache.size}`, inline: true }, { name: '👥 Total Members', value: `${totalMembers}`, inline: true }, { name: '📺 Total Channels', value: `${totalChannels}`, inline: true }, { name: '📅 Started', value: `<t:${Math.floor(client.readyTimestamp / 1000)}:R>`, inline: true }, { name: '🏓 Ping', value: `${client.ws.ping}ms`, inline: true }, { name: '📊 Memory', value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB`, inline: true })
            .setThumbnail(client.user?.displayAvatarURL({ size: 4096 }));
        await i.editReply({ embeds: [embed] });
    }
    async handlePing(i) {
        await i.deferReply();
        const embed = EmbedManager.info('Bot Latency', `WebSocket: ${i.client.ws.ping}ms`);
        await i.editReply({ embeds: [embed] });
    }
    async handleUptime(i) {
        await i.deferReply();
        const uptime = i.client.uptime;
        const days = Math.floor(uptime / 86400000);
        const hours = Math.floor((uptime % 86400000) / 3600000);
        const minutes = Math.floor((uptime % 3600000) / 60000);
        const seconds = Math.floor((uptime % 60000) / 1000);
        const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        const embed = EmbedManager.info('Bot Uptime', uptimeString);
        await i.editReply({ embeds: [embed] });
    }
    async handleStats(i) {
        await i.deferReply();
        const client = i.client;
        const totalMembers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        const totalChannels = client.guilds.cache.reduce((acc, guild) => acc + guild.channels.cache.size, 0);
        const totalEmojis = client.guilds.cache.reduce((acc, guild) => acc + guild.emojis.cache.size, 0);
        const totalRoles = client.guilds.cache.reduce((acc, guild) => acc + guild.roles.cache.size, 0);
        const embed = EmbedManager.info('Bot Statistics', 'Overall bot statistics')
            .addFields({ name: '🖥️ Servers', value: `${client.guilds.cache.size}`, inline: true }, { name: '👥 Total Members', value: `${totalMembers}`, inline: true }, { name: '📺 Total Channels', value: `${totalChannels}`, inline: true }, { name: '😀 Total Emojis', value: `${totalEmojis}`, inline: true }, { name: '🎨 Total Roles', value: `${totalRoles}`, inline: true }, { name: '📊 Cached Users', value: `${client.users.cache.size}`, inline: true });
        await i.editReply({ embeds: [embed] });
    }
    async handleId(i) {
        await i.deferReply();
        const mention = i.options.getString('mention', true);
        const id = mention.replace(/[<@!&>]/g, '');
        const embed = EmbedManager.info('ID Information', `ID: ${id}`);
        await i.editReply({ embeds: [embed] });
    }
    async handleSnowflake(i) {
        await i.deferReply();
        const snowflake = i.options.getString('snowflake', true);
        const timestamp = Math.floor((BigInt(snowflake) >> 22n) / 1000n);
        const date = new Date(timestamp * 1000);
        const embed = EmbedManager.info('Snowflake Timestamp', `Created: ${date.toISOString()}`);
        await i.editReply({ embeds: [embed] });
    }
    async handlePermissions(i) {
        await i.deferReply();
        const user = i.options.getUser('user') || i.user;
        if (!i.guild || !i.member) {
            await i.editReply({ content: '❌ This command can only be used in a server.' });
            return;
        }
        const member = i.guild.members.cache.get(user.id) || await i.guild.members.fetch(user.id).catch(() => null);
        if (!member) {
            await i.editReply({ content: '❌ Could not find this member in the server.' });
            return;
        }
        const permissions = member.permissions.toArray().slice(0, 15).map(p => p.replace(/_/g, ' ')).join(', ');
        const admin = member.permissions.has(PermissionFlagsBits.Administrator);
        const embed = EmbedManager.info('User Permissions', `**${user.tag}**'s permissions`)
            .addFields({ name: '🔑 Administrator', value: admin ? 'Yes' : 'No', inline: true }, { name: '📋 Permissions', value: permissions || 'None', inline: false });
        await i.editReply({ embeds: [embed] });
    }
    async handleEmojiInfo(i) {
        await i.deferReply();
        const emoji = i.options.getString('emoji', true);
        const emojiRegex = /<a?:\w+:(\d+)>/;
        const match = emoji.match(emojiRegex);
        if (!match) {
            await i.editReply({ content: '❌ Please provide a valid custom emoji.' });
            return;
        }
        const emojiId = match[1];
        const foundEmoji = i.client.emojis.cache.get(emojiId);
        if (!foundEmoji) {
            await i.editReply({ content: '❌ Could not find this emoji in cache.' });
            return;
        }
        const embed = EmbedManager.info('Emoji Information', foundEmoji.name || 'Unknown')
            .addFields({ name: '🆔 ID', value: foundEmoji.id, inline: true }, { name: '🎬 Animated', value: foundEmoji.animated ? 'Yes' : 'No', inline: true }, { name: '🖥️ Server', value: foundEmoji.guild?.name || 'Unknown', inline: true }, { name: '📅 Created', value: `<t:${Math.floor(foundEmoji.createdTimestamp / 1000)}:R>`, inline: true })
            .setThumbnail(foundEmoji.url);
        await i.editReply({ embeds: [embed] });
    }
    async handleWeather(i) {
        await i.deferReply();
        const location = i.options.getString('location', true);
        const embed = EmbedManager.info('Weather Information', `Location: ${location}`);
        await i.editReply({ embeds: [embed] });
    }
    async handleTime(i) {
        await i.deferReply();
        const timezone = i.options.getString('timezone') || 'UTC';
        try {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', { timeZone: timezone, hour12: true });
            const dateString = now.toLocaleDateString('en-US', { timeZone: timezone });
            const embed = EmbedManager.info('Time Information', `Time in ${timezone}`)
                .addFields({ name: '🕐 Time', value: timeString, inline: true }, { name: '📅 Date', value: dateString, inline: true });
            await i.editReply({ embeds: [embed] });
        }
        catch (error) {
            await i.editReply({ content: '❌ Invalid timezone. Please use a valid IANA timezone (e.g., America/New_York, Europe/London).' });
        }
    }
    async handleWikipedia(i) {
        await i.deferReply();
        const query = i.options.getString('query', true);
        const embed = EmbedManager.info('Wikipedia Search', `Query: ${query}`);
        await i.editReply({ embeds: [embed] });
    }
    async handleUrban(i) {
        await i.deferReply();
        const term = i.options.getString('term', true);
        const embed = EmbedManager.info('Urban Dictionary', `Term: ${term}`);
        await i.editReply({ embeds: [embed] });
    }
    async handleGithub(i) {
        await i.deferReply();
        const username = i.options.getString('username', true);
        const embed = EmbedManager.info('GitHub User', `Username: ${username}`);
        await i.editReply({ embeds: [embed] });
    }
    async handleCountry(i) {
        await i.deferReply();
        const country = i.options.getString('country', true);
        const embed = EmbedManager.info('Country Information', `Country: ${country}`);
        await i.editReply({ embeds: [embed] });
    }
    async executePrefix(m, args) {
        await m.reply({ content: 'Use slash command /info for full options.' });
    }
}
export default InfoCommand;
//# sourceMappingURL=info.js.map