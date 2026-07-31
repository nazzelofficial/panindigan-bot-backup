import { BaseCommand } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
export declare class GamesCommand extends BaseCommand {
    constructor();
    buildSlashCommand(): SlashCommandBuilder;
    executeSlash(i: ChatInputCommandInteraction): Promise<void>;
    private handleTicTacToe;
    private handleConnect4;
    private handleBattleship;
    private handleChess;
    private handleRPS;
    private handleRPSLS;
    private handle2048;
    private handleSnake;
    private handleMinesweeper;
    private handleSudoku;
    private handleWordle;
    private handleWordSearch;
    private handleMemory;
    private handleSimonSays;
    private handleReaction;
    private handleTyping;
    private handleWhackAMole;
    private handleBlackjack;
    private handleRoulette;
    private handleSlots;
    private handlePoker;
    private handleHigherLower;
    private handleTrivia;
    private handleAkinator;
    private handleHangman;
    private handleAdventure;
    private handleCharacter;
    private handleInventory;
    private handleBattle;
    executePrefix(m: Message, args: string[]): Promise<void>;
}
export default GamesCommand;
//# sourceMappingURL=games.d.ts.map