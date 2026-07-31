// @ts-nocheck
export class CompatibilityService {
    /**
     * Generate a deterministic compatibility score between two users.
     * Uses their IDs to ensure consistency (same pair always gets same base score).
     */
    calculateCompatibility(userId1, userId2) {
        // Deterministic hash-based compatibility
        const combined = [userId1, userId2].sort().join('');
        let hash = 0;
        for (let i = 0; i < combined.length; i++) {
            const char = combined.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash |= 0;
        }
        // Map hash to 1-100 range
        return Math.abs(hash % 100) + 1;
    }
    getCompatibilityMessage(score) {
        if (score >= 95)
            return { emoji: '💎', label: 'Soulmates', description: 'Perfect match! Tadhana talaga kayo.' };
        if (score >= 85)
            return { emoji: '❤️', label: 'Perfect Match', description: 'Para kayong ginawa para sa isa\'t isa!' };
        if (score >= 75)
            return { emoji: '💕', label: 'Great Couple', description: 'Maganda ang chemistry ninyo!' };
        if (score >= 60)
            return { emoji: '💙', label: 'Good Match', description: 'May konektasyon kayo!' };
        if (score >= 45)
            return { emoji: '💛', label: 'It\'s Possible', description: 'Kailangan lang ng mas maraming effort.' };
        if (score >= 30)
            return { emoji: '🧡', label: 'Complicated', description: 'Medyo challenging, pero pwede pa rin.' };
        return { emoji: '💔', label: 'Opposites', description: 'Hindi talaga kayo tugma... pero love wins daw!' };
    }
    getCompatibilityBar(score, size = 20) {
        const filled = Math.round((score / 100) * size);
        const empty = size - filled;
        return `[${'❤️'.repeat(Math.ceil(filled / 2))}${'🖤'.repeat(Math.ceil(empty / 2))}] ${score}%`;
    }
    generateLoveMessage(user1, user2, score) {
        const messages = [
            `${user1} at ${user2} — ${score}% compatible!`,
            `Ang compatibility ni ${user1} at ${user2} ay ${score}%!`,
            `${user1} 💕 ${user2} = ${score}% love match!`,
        ];
        return messages[Math.floor(Math.random() * messages.length)];
    }
}
export const compatibilityService = new CompatibilityService();
//# sourceMappingURL=CompatibilityService.js.map