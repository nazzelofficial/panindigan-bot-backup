import { BaseCommand } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
export declare class PremiumCommand extends BaseCommand {
    constructor();
    buildSlashCommand(): SlashCommandBuilder;
    executeSlash(i: ChatInputCommandInteraction): Promise<void>;
    executePrefix(m: Message, _args: string[]): Promise<void>;
}
export default PremiumCommand;
//# sourceMappingURL=premium.d.ts.map