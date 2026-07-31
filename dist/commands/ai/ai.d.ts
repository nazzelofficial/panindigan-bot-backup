import { BaseCommand } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
export declare class AICommand extends BaseCommand {
    constructor();
    buildSlashCommand(): SlashCommandBuilder;
    executeSlash(i: ChatInputCommandInteraction): Promise<void>;
    private handleAsk;
    private handleChat;
    private handleGenerateText;
    private handleGenerateImage;
    private handleGenerateCode;
    private handleAnalyzeText;
    private handleSentiment;
    private handleSummarize;
    private handleExplain;
    private handleTranslate;
    private handleRewrite;
    private handleImprove;
    private handleFactCheck;
    private handleCodeGenerate;
    private handleCodeReview;
    private handleCodeDebug;
    private handleCodeOptimize;
    private handleCodeExplain;
    private handleVisionDescribe;
    private handleVisionOCR;
    private handleSecurityAnalyze;
    private handleSecurityAudit;
    executePrefix(m: Message, args: string[]): Promise<void>;
}
export default AICommand;
//# sourceMappingURL=ai.d.ts.map