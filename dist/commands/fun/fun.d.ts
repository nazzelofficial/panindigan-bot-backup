import { BaseCommand } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
export declare class FunCommand extends BaseCommand {
    constructor();
    buildSlashCommand(): SlashCommandBuilder;
    executeSlash(i: ChatInputCommandInteraction): Promise<void>;
    private handleJoke;
    private handleDadJoke;
    private handleMeme;
    private handle8Ball;
    private handleCat;
    private handleDog;
    private handleFox;
    private handleDuck;
    private handlePanda;
    private handleShiba;
    private handleCapybara;
    private handleTarot;
    private handleHoroscope;
    private handleShip;
    private handleRate;
    private handleChoose;
    private handleAscii;
    private handleQuote;
    private handleFact;
    private handleBirthday;
    executePrefix(m: Message, args: string[]): Promise<void>;
}
export default FunCommand;
//# sourceMappingURL=fun.d.ts.map