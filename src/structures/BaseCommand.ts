// @ts-nocheck
import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  ContextMenuCommandInteraction,
  Message,
  PermissionResolvable,
  Client,
} from 'discord.js';

export interface Event {
  name: string;
  once?: boolean;
  execute: (...args: any[]) => Promise<void> | void;
}

export type CommandCategory =
  | 'help'
  | 'moderation'
  | 'admin'
  | 'music'
  | 'economy'
  | 'games'
  | 'fun'
  | 'ai'
  | 'info'
  | 'utility'
  | 'social'
  | 'leveling'
  | 'giveaway'
  | 'image'
  | 'starboard'
  | 'applications'
  | 'premium'
  | 'owner';

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
  aliases?: string[];
  examples?: string[];
}

export abstract class BaseCommand {
  public readonly name: string;
  public readonly description: string;
  public readonly category: CommandCategory;
  public readonly premiumTier: PremiumTier;
  public readonly cooldown: number;
  public readonly userPermissions: PermissionResolvable[];
  public readonly botPermissions: PermissionResolvable[];
  public readonly ownerOnly: boolean;
  public readonly guildOnly: boolean;
  public readonly slashCommand: boolean;
  public readonly prefixCommand: boolean;
  public readonly aliases: string[];
  public readonly examples: string[];

  constructor(options: CommandOptions) {
    this.name = options.name;
    this.description = options.description;
    this.category = options.category;
    this.premiumTier = options.premiumTier ?? 'free';
    this.cooldown = options.cooldown ?? 3;
    this.userPermissions = options.userPermissions ?? [];
    this.botPermissions = options.botPermissions ?? [];
    this.ownerOnly = options.ownerOnly ?? false;
    this.guildOnly = options.guildOnly ?? false;
    this.slashCommand = options.slashCommand ?? true;
    this.prefixCommand = options.prefixCommand ?? true;
    this.aliases = options.aliases ?? [];
    this.examples = options.examples ?? [];
  }

  public abstract executeSlash(interaction: ChatInputCommandInteraction): Promise<void>;
  public abstract executePrefix(message: Message, _args: string[]): Promise<void>;

  public buildSlashCommand(): SlashCommandBuilder {
    const builder = new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description);

    if (this.guildOnly) {
      builder.setDMPermission(false);
    }

    return builder;
  }
}
