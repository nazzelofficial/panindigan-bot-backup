import { BaseCommand } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
export declare class BotCommand extends BaseCommand {
    constructor();
    buildSlashCommand(): SlashCommandBuilder;
    executeSlash(interaction: ChatInputCommandInteraction): Promise<void>;
    executePrefix(message: Message, args: string[]): Promise<void>;
    private handleProfile;
    private handleServer;
    private handleProfilePrefix;
    private handleServerPrefix;
}
export default BotCommand;
//# sourceMappingURL=bot.d.ts.map