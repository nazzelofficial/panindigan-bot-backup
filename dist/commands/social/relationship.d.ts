import { BaseCommand } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
export declare class RelationshipCommand extends BaseCommand {
    constructor();
    buildSlashCommand(): SlashCommandBuilder;
    executeSlash(i: ChatInputCommandInteraction): Promise<void>;
    private handlePropose;
    private handleAccept;
    private handleDecline;
    private handleCancel;
    private handleInfo;
    private handleDivorce;
    private handleAnniversary;
    private handleGoals;
    private handleNickname;
    private handleMessage;
    private handleBackground;
    private handleCard;
    private handleStats;
    private handleHistory;
    executePrefix(m: Message, args: string[]): Promise<void>;
}
export default RelationshipCommand;
//# sourceMappingURL=relationship.d.ts.map