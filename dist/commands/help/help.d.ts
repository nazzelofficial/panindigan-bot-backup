import { BaseCommand } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
export declare class HelpCommand extends BaseCommand {
    constructor();
    buildSlashCommand(): SlashCommandBuilder;
    executeSlash(interaction: ChatInputCommandInteraction): Promise<void>;
    executePrefix(message: Message, _args: string[]): Promise<void>;
    private showMainHelp;
    private showCommandHelp;
    private showCategoryHelp;
}
export default HelpCommand;
//# sourceMappingURL=help.d.ts.map