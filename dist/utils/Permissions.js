// @ts-nocheck
import { PermissionFlagsBits, ChannelType } from 'discord.js';
export class Permissions {
    static hasPermission(member, requiredPermissions) {
        if (!requiredPermissions || requiredPermissions.length === 0)
            return true;
        // Use PermissionsBitField.has() directly — NOT .bitfield (which is a raw bigint)
        return requiredPermissions.every(p => member.permissions.has(p));
    }
    static hasBotPermission(member, requiredPermissions) {
        if (!requiredPermissions || requiredPermissions.length === 0) {
            return { hasPermission: true, missing: [] };
        }
        const me = member.guild.members.me;
        if (!me)
            return { hasPermission: false, missing: requiredPermissions };
        const missing = [];
        for (const permission of requiredPermissions) {
            if (!me.permissions.has(permission)) {
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
            [String(PermissionFlagsBits.CreateInstantInvite)]: 'Create Instant Invite',
            [String(PermissionFlagsBits.KickMembers)]: 'Kick Members',
            [String(PermissionFlagsBits.BanMembers)]: 'Ban Members',
            [String(PermissionFlagsBits.Administrator)]: 'Administrator',
            [String(PermissionFlagsBits.ManageChannels)]: 'Manage Channels',
            [String(PermissionFlagsBits.ManageGuild)]: 'Manage Server',
            [String(PermissionFlagsBits.AddReactions)]: 'Add Reactions',
            [String(PermissionFlagsBits.ViewAuditLog)]: 'View Audit Log',
            [String(PermissionFlagsBits.PrioritySpeaker)]: 'Priority Speaker',
            [String(PermissionFlagsBits.Stream)]: 'Stream',
            [String(PermissionFlagsBits.ReadMessageHistory)]: 'Read Message History',
            [String(PermissionFlagsBits.SendTTSMessages)]: 'Send TTS Messages',
            [String(PermissionFlagsBits.ManageMessages)]: 'Manage Messages',
            [String(PermissionFlagsBits.EmbedLinks)]: 'Embed Links',
            [String(PermissionFlagsBits.AttachFiles)]: 'Attach Files',
            [String(PermissionFlagsBits.MentionEveryone)]: 'Mention Everyone',
            [String(PermissionFlagsBits.ExternalEmojis)]: 'Use External Emojis',
            [String(PermissionFlagsBits.ViewGuildInsights)]: 'View Server Insights',
            [String(PermissionFlagsBits.Connect)]: 'Connect',
            [String(PermissionFlagsBits.Speak)]: 'Speak',
            [String(PermissionFlagsBits.MuteMembers)]: 'Mute Members',
            [String(PermissionFlagsBits.DeafenMembers)]: 'Deafen Members',
            [String(PermissionFlagsBits.MoveMembers)]: 'Move Members',
            [String(PermissionFlagsBits.UseVAD)]: 'Use Voice Activity Detection',
            [String(PermissionFlagsBits.ChangeNickname)]: 'Change Nickname',
            [String(PermissionFlagsBits.ManageNicknames)]: 'Manage Nicknames',
            [String(PermissionFlagsBits.ManageRoles)]: 'Manage Roles',
            [String(PermissionFlagsBits.ManageWebhooks)]: 'Manage Webhooks',
            [String(PermissionFlagsBits.ManageGuildExpressions)]: 'Manage Expressions',
            [String(PermissionFlagsBits.UseApplicationCommands)]: 'Use Application Commands',
            [String(PermissionFlagsBits.RequestToSpeak)]: 'Request to Speak',
            [String(PermissionFlagsBits.ManageEvents)]: 'Manage Events',
            [String(PermissionFlagsBits.ManageThreads)]: 'Manage Threads',
            [String(PermissionFlagsBits.CreatePublicThreads)]: 'Create Public Threads',
            [String(PermissionFlagsBits.CreatePrivateThreads)]: 'Create Private Threads',
            [String(PermissionFlagsBits.UseExternalStickers)]: 'Use External Stickers',
            [String(PermissionFlagsBits.SendMessagesInThreads)]: 'Send Messages in Threads',
            [String(PermissionFlagsBits.UseEmbeddedActivities)]: 'Use Embedded Activities',
            [String(PermissionFlagsBits.ModerateMembers)]: 'Moderate Members',
            [String(PermissionFlagsBits.UseSoundboard)]: 'Use Soundboard',
            [String(PermissionFlagsBits.CreateGuildExpressions)]: 'Create Expressions',
            [String(PermissionFlagsBits.CreateEvents)]: 'Create Events',
            [String(PermissionFlagsBits.UseExternalSounds)]: 'Use External Sounds',
            [String(PermissionFlagsBits.SendVoiceMessages)]: 'Send Voice Messages',
        };
        return permissions.map(p => permissionNames[String(p)] || 'Unknown Permission');
    }
}
//# sourceMappingURL=Permissions.js.map