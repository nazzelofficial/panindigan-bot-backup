import { SlashCommandBuilder, ChatInputCommandInteraction, ContextMenuCommandInteraction, Message, PermissionResolvable, ApplicationCommandType } from 'discord.js';
export interface Event {
    name: string;
    once?: boolean;
    execute: (...args: any[]) => Promise<void> | void;
}
export type CommandCategory = 'help' | 'moderation' | 'admin' | 'music' | 'economy' | 'games' | 'fun' | 'ai' | 'info' | 'utility' | 'social' | 'leveling' | 'giveaway' | 'image' | 'starboard' | 'applications' | 'premium' | 'owner';
export type PremiumTier = 'free' | 'bronze' | 'silver' | 'gold' | 'diamond';
export interface CommandOptions {
    name: string;
    description: string;
    category: CommandCategory;
    premiumTier?: PremiumTier;
    cooldown?: number;
    userPermissions?: PermissionResolvable[];
    botPermissions?: PermissionResolvable[];
    ownerOnly?: boolean;
    guildOnly?: boolean;
    slashCommand?: boolean;
    prefixCommand?: boolean;
    contextMenuCommand?: boolean;
    contextMenuType?: ApplicationCommandType;
    aliases?: string[];
    examples?: string[];
}
export declare abstract class BaseCommand {
    readonly name: string;
    readonly description: string;
    readonly category: CommandCategory;
    readonly premiumTier: PremiumTier;
    readonly cooldown: number;
    readonly userPermissions: PermissionResolvable[];
    readonly botPermissions: PermissionResolvable[];
    readonly ownerOnly: boolean;
    readonly guildOnly: boolean;
    readonly slashCommand: boolean;
    readonly prefixCommand: boolean;
    readonly contextMenuCommand: boolean;
    readonly contextMenuType: ApplicationCommandType | undefined;
    readonly aliases: string[];
    readonly examples: string[];
    constructor(options: CommandOptions);
    abstract executeSlash(interaction: ChatInputCommandInteraction): Promise<void>;
    abstract executePrefix(message: Message, _args: string[]): Promise<void>;
    executeContext(interaction: ContextMenuCommandInteraction): Promise<void>;
    buildSlashCommand(): SlashCommandBuilder;
}
//# sourceMappingURL=BaseCommand.d.ts.map