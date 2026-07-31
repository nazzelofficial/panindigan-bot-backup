import { PanindiganClient } from '../structures/PanindiganClient.js';
export declare function checkCooldown(client: PanindiganClient, userId: string, guildId: string, commandName: string, premiumTier?: string): Promise<{
    canRun: boolean;
    remaining: number;
}>;
//# sourceMappingURL=CooldownHandler.d.ts.map