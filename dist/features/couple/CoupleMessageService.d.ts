import { Client, User } from 'discord.js';
export declare class CoupleMessageService {
    sendPrivateMessage(client: Client, fromUser: User, toUserId: string, message: string, isAnonymous?: boolean): Promise<{
        success: boolean;
        error?: string;
    }>;
    sendLoveLetter(client: Client, fromUser: User, toUserId: string, letter: string): Promise<{
        success: boolean;
        error?: string;
    }>;
    sendAnniversaryNotification(client: Client, userId1: string, userId2: string, channelId: string, years: number): Promise<void>;
}
export declare const coupleMessageService: CoupleMessageService;
//# sourceMappingURL=CoupleMessageService.d.ts.map