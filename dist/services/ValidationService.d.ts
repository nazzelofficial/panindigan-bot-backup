import { ChatInputCommandInteraction, Message, GuildMember } from 'discord.js';
export interface ValidationOptions {
    requireGuild?: boolean;
    requireVoice?: boolean;
    requireSameVoice?: boolean;
    requirePermissions?: PermissionFlagsBits[];
    requireBotPermissions?: PermissionFlagsBits[];
    requirePremium?: 'free' | 'bronze' | 'silver' | 'gold' | 'diamond';
    cooldown?: number;
    checkBlacklist?: boolean;
}
export interface ValidationResult {
    valid: boolean;
    error?: string;
    data?: any;
}
declare class ValidationService {
    private prisma;
    validateInteraction(interaction: ChatInputCommandInteraction | Message, options?: ValidationOptions): Promise<ValidationResult>;
    private checkBlacklist;
    private checkPremium;
    private checkCooldown;
    private checkVoice;
    private checkPermissions;
    private checkBotPermissions;
    validateMusicPlayer(interaction: ChatInputCommandInteraction | Message): Promise<ValidationResult>;
    validateModerationAction(interaction: ChatInputCommandInteraction | Message, targetUser: GuildMember): Promise<ValidationResult>;
    validateEconomyTransaction(interaction: ChatInputCommandInteraction | Message, amount: number): Promise<ValidationResult>;
    validateInput(input: string, type?: 'url' | 'email' | 'number' | 'text'): Promise<ValidationResult>;
}
export declare const validationService: ValidationService;
export default validationService;
//# sourceMappingURL=ValidationService.d.ts.map