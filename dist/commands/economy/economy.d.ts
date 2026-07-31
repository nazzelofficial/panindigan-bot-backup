import { BaseCommand } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
export declare class EconomyCommand extends BaseCommand {
    constructor();
    buildSlashCommand(): SlashCommandBuilder;
    executeSlash(i: ChatInputCommandInteraction): Promise<void>;
    private handleBalance;
    private handleWallet;
    private handleBank;
    private handleDeposit;
    private handleWithdraw;
    private handleTransfer;
    private handleDaily;
    private handleWeekly;
    private handleMonthly;
    private handleWork;
    private handleBeg;
    private handleCrime;
    private handleInvest;
    private handleShopView;
    private handleShopBuy;
    private handleShopSell;
    private handleInventory;
    private handleCoinflip;
    private handleDice;
    private handleSlots;
    private handleBlackjack;
    private handleRoulette;
    private handleBusinessStart;
    private handleBusinessUpgrade;
    private handleBusinessSell;
    private handleBusinessInfo;
    private handleLeaderboard;
    private handleProfile;
    executePrefix(m: Message, args: string[]): Promise<void>;
}
export default EconomyCommand;
//# sourceMappingURL=economy.d.ts.map