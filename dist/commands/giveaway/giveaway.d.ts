import { BaseCommand } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
export declare class GiveawayCommand extends BaseCommand {
    constructor();
    buildSlashCommand(): SlashCommandBuilder;
    private parseDuration;
    private startGiveaway;
    private endGiveaway;
    executeSlash(i: ChatInputCommandInteraction): Promise<void>;
    executePrefix(m: Message, _args: string[]): Promise<void>;
}
export default GiveawayCommand;
//# sourceMappingURL=giveaway.d.ts.map