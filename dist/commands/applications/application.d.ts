import { BaseCommand } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
export declare class ApplicationCommand extends BaseCommand {
    constructor();
    buildSlashCommand(): SlashCommandBuilder;
    executeSlash(i: ChatInputCommandInteraction): Promise<void>;
    executePrefix(m: Message, _args: string[]): Promise<void>;
}
export default ApplicationCommand;
//# sourceMappingURL=application.d.ts.map