export declare class CompatibilityService {
    /**
     * Generate a deterministic compatibility score between two users.
     * Uses their IDs to ensure consistency (same pair always gets same base score).
     */
    calculateCompatibility(userId1: string, userId2: string): number;
    getCompatibilityMessage(score: number): {
        emoji: string;
        label: string;
        description: string;
    };
    getCompatibilityBar(score: number, size?: number): string;
    generateLoveMessage(user1: string, user2: string, score: number): string;
}
export declare const compatibilityService: CompatibilityService;
//# sourceMappingURL=CompatibilityService.d.ts.map