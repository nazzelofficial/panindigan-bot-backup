import { BaseCommand } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
export declare class UtilityCommand extends BaseCommand {
    constructor();
    buildSlashCommand(): SlashCommandBuilder;
    executeSlash(i: ChatInputCommandInteraction): Promise<void>;
    private handleAfk;
    private handleBirthday;
    private handleReminder;
    private handleTicket;
    private handleSearchGoogle;
    private handleSearchYoutube;
    private handleSearchUrban;
    private handleToolsCalc;
    private handleToolsCharCount;
    private handleToolsColor;
    private rgbToHsl;
    private handleToolsCurrency;
    private handleToolsQr;
    private handleToolsTimestamp;
    private handleToolsShorten;
    private handleNotesAdd;
    private handleNotesList;
    private handleNotesRemove;
    private handleNotesClear;
    executePrefix(m: Message, args: string[]): Promise<void>;
}
export default UtilityCommand;
//# sourceMappingURL=utility.d.ts.map