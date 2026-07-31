import { Message, GuildMember } from 'discord.js';
import { PanindiganClient } from '../structures/PanindiganClient.js';
export declare class AutoModHandler {
    checkMessage(message: Message, client: PanindiganClient): Promise<void>;
    private checkSpam;
    private checkLinks;
    private checkBadWords;
    private checkPhishing;
    checkNewMember(member: GuildMember, client: PanindiganClient): Promise<void>;
    private handleViolation;
    checkAntiRaid(guild: any, joinCount: number, timeWindowMs: number): Promise<boolean>;
}
export declare const autoModHandler: AutoModHandler;
//# sourceMappingURL=AutoModHandler.d.ts.map