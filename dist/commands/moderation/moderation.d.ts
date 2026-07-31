import { BaseCommand } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
export declare class ModerationCommand extends BaseCommand {
    constructor();
    buildSlashCommand(): SlashCommandBuilder;
    executeSlash(i: ChatInputCommandInteraction): Promise<void>;
    private handleBan;
    private handleKick;
    private handleMute;
    private handleUnmute;
    private handleTimeout;
    private handleWarn;
    private handleUnban;
    private handleLock;
    private handleUnlock;
    private handleSlowmode;
    private handleRoleAdd;
    private handleRoleRemove;
    private handlePurge;
    private handlePurgeUser;
    private handleWarnings;
    private handleHistory;
    private handleBanlist;
    private handleAuditlog;
    private handleAutomod;
    private handleRaidmode;
    private handleFilter;
    executePrefix(m: Message, args: string[]): Promise<void>;
}
export default ModerationCommand;
//# sourceMappingURL=moderation.d.ts.map