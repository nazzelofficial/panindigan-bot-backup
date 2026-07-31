import { BaseCommand } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
export declare class LevelingCommand extends BaseCommand {
    constructor();
    buildSlashCommand(): SlashCommandBuilder;
    executeSlash(i: ChatInputCommandInteraction): Promise<void>;
    private handleRank;
    private handleLevel;
    private handleXp;
    private handleLeaderboard;
    private handleConfigToggle;
    private handleConfigChannel;
    private handleConfigMultiplier;
    private handleConfigMessage;
    private handleRolesAdd;
    private handleRolesRemove;
    private handleRolesList;
    private handleRolesSync;
    private handleStats;
    private handleReset;
    executePrefix(m: Message, args: string[]): Promise<void>;
}
export default LevelingCommand;
//# sourceMappingURL=leveling.d.ts.map