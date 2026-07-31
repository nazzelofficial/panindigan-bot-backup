import { BaseCommand } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
export declare class ImageCommand extends BaseCommand {
    constructor();
    buildSlashCommand(): SlashCommandBuilder;
    private fetchAvatarBuffer;
    executeSlash(i: ChatInputCommandInteraction): Promise<void>;
    executePrefix(m: Message, _args: string[]): Promise<void>;
}
export default ImageCommand;
//# sourceMappingURL=image.d.ts.map