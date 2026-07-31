import { BaseCommand } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
export declare class ConfigCommand extends BaseCommand {
    constructor();
    buildSlashCommand(): SlashCommandBuilder;
    executeSlash(interaction: ChatInputCommandInteraction): Promise<void>;
    executePrefix(message: Message, args: string[]): Promise<void>;
    private showConfig;
    private handleRoles;
    private handleChannels;
    private handleGeneral;
    private handleIgnore;
    private handleRolesPrefix;
    private handleChannelsPrefix;
    private handleGeneralPrefix;
    private handleIgnorePrefix;
}
export default ConfigCommand;
//# sourceMappingURL=config.d.ts.map