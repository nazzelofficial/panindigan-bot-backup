// @ts-nocheck
import { SlashCommandBuilder, } from 'discord.js';
export class BaseCommand {
    name;
    description;
    category;
    premiumTier;
    cooldown;
    userPermissions;
    botPermissions;
    ownerOnly;
    guildOnly;
    slashCommand;
    prefixCommand;
    aliases;
    examples;
    constructor(options) {
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
    buildSlashCommand() {
        const builder = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description);
        if (this.guildOnly) {
            builder.setDMPermission(false);
        }
        return builder;
    }
}
