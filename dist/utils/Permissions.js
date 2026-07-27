// @ts-nocheck
import { PermissionFlagsBits, ChannelType } from 'discord.js';
export class Permissions {
    static hasPermission(member, requiredPermissions) {
        if (requiredPermissions.length === 0)
            return true;
        const memberPermissions = member.permissions.bitfield;
        for (const permission of requiredPermissions) {
            if (!memberPermissions.has(permission)) {
                return false;
            }
        }
        return true;
    }
    static hasBotPermission(member, requiredPermissions) {
        if (requiredPermissions.length === 0)
            return { hasPermission: true, missing: [] };
        const me = member.guild.members.me;
        if (!me)
            return { hasPermission: false, missing: requiredPermissions };
        const botPermissions = me.permissions.bitfield;
        const missing = [];
        for (const permission of requiredPermissions) {
            if (!botPermissions.has(permission)) {
                missing.push(permission);
            }
        }
        return {
            hasPermission: missing.length === 0,
            missing,
        };
    }
    static canManageChannel(member, channelType) {
        if (channelType === ChannelType.GuildVoice) {
            return member.permissions.has(PermissionFlagsBits.Connect) &&
                member.permissions.has(PermissionFlagsBits.Speak);
        }
        if (channelType === ChannelType.GuildText || channelType === ChannelType.GuildAnnouncement) {
            return member.permissions.has(PermissionFlagsBits.SendMessages) &&
                member.permissions.has(PermissionFlagsBits.ViewChannel);
        }
        return member.permissions.has(PermissionFlagsBits.ViewChannel);
    }
    static isModerator(member) {
        return member.permissions.has(PermissionFlagsBits.ModerateMembers) ||
            member.permissions.has(PermissionFlagsBits.BanMembers) ||
            member.permissions.has(PermissionFlagsBits.KickMembers) ||
            member.permissions.has(PermissionFlagsBits.ManageMessages);
    }
    static isAdministrator(member) {
        return member.permissions.has(PermissionFlagsBits.Administrator);
    }
    static isOwner(member, ownerIds) {
        return ownerIds.includes(member.id);
    }
    static getMissingPermissionNames(permissions) {
        const permissionNames = {
            [PermissionFlagsBits.CreateInstantInvite]: 'Create Instant Invite',
            [PermissionFlagsBits.KickMembers]: 'Kick Members',
            [PermissionFlagsBits.BanMembers]: 'Ban Members',
            [PermissionFlagsBits.Administrator]: 'Administrator',
            [PermissionFlagsBits.ManageChannels]: 'Manage Channels',
            [PermissionFlagsBits.ManageGuild]: 'Manage Server',
            [PermissionFlagsBits.AddReactions]: 'Add Reactions',
            [PermissionFlagsBits.ViewAuditLog]: 'View Audit Log',
            [PermissionFlagsBits.PrioritySpeaker]: 'Priority Speaker',
            [PermissionFlagsBits.Stream]: 'Stream',
            [PermissionFlagsBits.ReadMessageHistory]: 'Read Message History',
            [PermissionFlagsBits.SendTTSMessages]: 'Send TTS Messages',
            [PermissionFlagsBits.ManageMessages]: 'Manage Messages',
            [PermissionFlagsBits.EmbedLinks]: 'Embed Links',
            [PermissionFlagsBits.AttachFiles]: 'Attach Files',
            [PermissionFlagsBits.ReadMessageHistory]: 'Read Message History',
            [PermissionFlagsBits.MentionEveryone]: 'Mention Everyone',
            [PermissionFlagsBits.ExternalEmojis]: 'Use External Emojis',
            [PermissionFlagsBits.ViewGuildInsights]: 'View Server Insights',
            [PermissionFlagsBits.Connect]: 'Connect',
            [PermissionFlagsBits.Speak]: 'Speak',
            [PermissionFlagsBits.MuteMembers]: 'Mute Members',
            [PermissionFlagsBits.DeafenMembers]: 'Deafen Members',
            [PermissionFlagsBits.MoveMembers]: 'Move Members',
            [PermissionFlagsBits.UseVAD]: 'Use Voice Activity Detection',
            [PermissionFlagsBits.ChangeNickname]: 'Change Nickname',
            [PermissionFlagsBits.ManageNicknames]: 'Manage Nicknames',
            [PermissionFlagsBits.ManageRoles]: 'Manage Roles',
            [PermissionFlagsBits.ManageWebhooks]: 'Manage Webhooks',
            [PermissionFlagsBits.ManageGuildExpressions]: 'Manage Expressions',
            [PermissionFlagsBits.UseApplicationCommands]: 'Use Application Commands',
            [PermissionFlagsBits.RequestToSpeak]: 'Request to Speak',
            [PermissionFlagsBits.ManageEvents]: 'Manage Events',
            [PermissionFlagsBits.ManageThreads]: 'Manage Threads',
            [PermissionFlagsBits.CreatePublicThreads]: 'Create Public Threads',
            [PermissionFlagsBits.CreatePrivateThreads]: 'Create Private Threads',
            [PermissionFlagsBits.UseExternalStickers]: 'Use External Stickers',
            [PermissionFlagsBits.SendMessagesInThreads]: 'Send Messages in Threads',
            [PermissionFlagsBits.UseEmbeddedActivities]: 'Use Embedded Activities',
            [PermissionFlagsBits.ModerateMembers]: 'Moderate Members',
            [PermissionFlagsBits.ViewCreatorMonetizationAnalytics]: 'View Creator Monetization Analytics',
            [PermissionFlagsBits.UseSoundboard]: 'Use Soundboard',
            [PermissionFlagsBits.CreateGuildExpressions]: 'Create Expressions',
            [PermissionFlagsBits.CreateEvents]: 'Create Events',
            [PermissionFlagsBits.UseExternalSounds]: 'Use External Sounds',
            [PermissionFlagsBits.SendVoiceMessages]: 'Send Voice Messages',
        };
        return permissions.map(p => permissionNames[p] || 'Unknown Permission');
    }
}
