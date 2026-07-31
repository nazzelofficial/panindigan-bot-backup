import { GuildMember, ChannelType, PermissionResolvable } from 'discord.js';
export declare class Permissions {
    static hasPermission(member: GuildMember, requiredPermissions: PermissionResolvable[]): boolean;
    static hasBotPermission(member: GuildMember, requiredPermissions: PermissionResolvable[]): {
        hasPermission: boolean;
        missing: PermissionResolvable[];
    };
    static canManageChannel(member: GuildMember, channelType: ChannelType): boolean;
    static isModerator(member: GuildMember): boolean;
    static isAdministrator(member: GuildMember): boolean;
    static isOwner(member: GuildMember, ownerIds: string[]): boolean;
    static getMissingPermissionNames(permissions: PermissionResolvable[]): string[];
}
//# sourceMappingURL=Permissions.d.ts.map