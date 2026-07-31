/**
 * ═══════════════════════════════════════════════════
 *  Panindigan Premium Formatters
 *  Professional formatting utilities
 * ═══════════════════════════════════════════════════
 */
export declare class DurationFormatter {
    /**
     * Format milliseconds to human-readable duration
     */
    static format(ms: number): string;
    /**
     * Format milliseconds to time format (HH:MM:SS)
     */
    static formatTime(ms: number): string;
    /**
     * Format milliseconds to short time format (MM:SS)
     */
    static formatShort(ms: number): string;
    /**
     * Format milliseconds to precise format (Xh Ym Zs)
     */
    static formatPrecise(ms: number): string;
    /**
     * Parse human-readable duration to milliseconds
     */
    static parse(duration: string): number;
}
export declare class NumberFormatter {
    /**
     * Format number with commas
     */
    static format(num: number): string;
    /**
     * Format number with specified decimal places
     */
    static formatDecimal(num: number, decimals?: number): string;
    /**
     * Format number as percentage
     */
    static formatPercentage(num: number, decimals?: number): string;
    /**
     * Format number as currency (Philippine Peso)
     */
    static formatCurrency(num: number, symbol?: string): string;
    /**
     * Format number with suffix (K, M, B, T)
     */
    static formatCompact(num: number): string;
    /**
     * Format number with ordinal suffix (1st, 2nd, 3rd, etc.)
     */
    static formatOrdinal(num: number): string;
    /**
     * Format bytes to human-readable format
     */
    static formatBytes(bytes: number): string;
}
export declare class RelativeTimeFormatter {
    /**
     * Format date as relative time (e.g., "2 hours ago")
     */
    static format(date: Date | string): string;
    /**
     * Format date as relative time in future (e.g., "in 2 hours")
     */
    static formatFuture(date: Date | string): string;
    /**
     * Format date in a specific format
     */
    static formatDate(date: Date | string, format?: 'short' | 'long' | 'full'): string;
}
export declare class PermissionFormatter {
    /**
     * Format permission flags to human-readable names
     */
    static formatPermissions(permissions: bigint | string[]): string;
    /**
     * Format single permission flag to human-readable name
     */
    static formatPermission(permission: string): string;
    /**
     * Check if user has administrator permission
     */
    static isAdministrator(permissions: bigint | string[]): boolean;
    /**
     * Check if user has moderator permissions
     */
    static isModerator(permissions: bigint | string[]): boolean;
}
export declare class TextFormatter {
    /**
     * Truncate text to specified length
     */
    static truncate(text: string, maxLength: number, suffix?: string): string;
    /**
     * Capitalize first letter
     */
    static capitalize(text: string): string;
    /**
     * Convert to title case
     */
    static titleCase(text: string): string;
    /**
     * Escape markdown characters
     */
    static escapeMarkdown(text: string): string;
    /**
     * Clean text (remove special characters)
     */
    static clean(text: string): string;
    /**
     * Format code block
     */
    static codeBlock(text: string, language?: string): string;
    /**
     * Format inline code
     */
    static inlineCode(text: string): string;
    /**
     * Format bold text
     */
    static bold(text: string): string;
    /**
     * Format italic text
     */
    static italic(text: string): string;
    /**
     * Format underline text
     */
    static underline(text: string): string;
    /**
     * Format strikethrough text
     */
    static strikethrough(text: string): string;
    /**
     * Format spoiler
     */
    static spoiler(text: string): string;
    /**
     * Format quote
     */
    static quote(text: string): string;
    /**
     * Format hyperlink
     */
    static hyperlink(text: string, url: string): string;
    /**
     * Format mention
     */
    static mention(id: string, type?: 'user' | 'role' | 'channel'): string;
    /**
     * Format timestamp
     */
    static timestamp(date: Date | number, style?: 't' | 'T' | 'd' | 'D' | 'f' | 'F' | 'R'): string;
}
export declare const Formatters: {
    readonly duration: typeof DurationFormatter;
    readonly number: typeof NumberFormatter;
    readonly relativeTime: typeof RelativeTimeFormatter;
    readonly permission: typeof PermissionFormatter;
    readonly text: typeof TextFormatter;
};
//# sourceMappingURL=Formatters.d.ts.map