import { BaseCommand } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
export declare class StarboardCommand extends BaseCommand {
    constructor();
    buildSlashCommand(): SlashCommandBuilder;
    executeSlash(i: ChatInputCommandInteraction): Promise<void>;
    private handleStats;
    private handleLeaderboard;
    private handleRandom;
    private handleIgnore;
    private handleUnignore;
    private handleReset;
    private handleUnlock;
    executePrefix(m: Message, _args: string[]): Promise<void>;
}
export default StarboardCommand;
//# sourceMappingURL=starboard.d.ts.map