import { BaseCommand } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
export declare class AIConfigCommand extends BaseCommand {
    constructor();
    buildSlashCommand(): SlashCommandBuilder;
    executeSlash(interaction: ChatInputCommandInteraction): Promise<void>;
    executePrefix(message: Message, args: string[]): Promise<void>;
    private showConfig;
    private handleProvider;
    private handleModel;
    private handleUsage;
    private handleFallback;
    private handleProviderPrefix;
    private handleModelPrefix;
    private handleUsagePrefix;
    private handleFallbackPrefix;
}
export default AIConfigCommand;
//# sourceMappingURL=aiconfig.d.ts.map