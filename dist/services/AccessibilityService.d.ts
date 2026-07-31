import { EmbedBuilder } from 'discord.js';
export interface AccessibilityOptions {
    screenReaderFriendly?: boolean;
    highContrast?: boolean;
    reducedMotion?: boolean;
    largeText?: boolean;
    theme?: 'light' | 'dark' | 'auto';
}
export interface ResponsiveEmbedOptions {
    mobile?: boolean;
    desktop?: boolean;
    compact?: boolean;
}
declare class AccessibilityService {
    private userPreferences;
    /**
     * Set user accessibility preferences
     */
    setUserPreferences(userId: string, preferences: AccessibilityOptions): void;
    /**
     * Get user accessibility preferences
     */
    getUserPreferences(userId: string): AccessibilityOptions;
    /**
     * Create an accessible embed with proper contrast and descriptions
     */
    createAccessibleEmbed(options: {
        title: string;
        description: string;
        color?: number;
        userId?: string;
    }, accessibility?: AccessibilityOptions): EmbedBuilder;
    /**
     * Format text for accessibility
     */
    private formatForAccessibility;
    /**
     * Get accessible color with proper contrast
     */
    private getAccessibleColor;
    /**
     * Create responsive embed for mobile/desktop
     */
    createResponsiveEmbed(options: ResponsiveEmbedOptions & {
        title: string;
        description: string;
        fields?: Array<{
            name: string;
            value: string;
            inline?: boolean;
        }>;
        color?: number;
    }): EmbedBuilder;
    /**
     * Create accessible button labels
     */
    getAccessibleLabel(label: string, context: string): string;
    /**
     * Check if embed meets accessibility standards
     */
    validateEmbedAccessibility(embed: EmbedBuilder): {
        valid: boolean;
        issues: string[];
    };
    /**
     * Get theme-appropriate colors
     */
    getThemeColors(theme: 'light' | 'dark' | 'auto'): {
        background: number;
        text: number;
        accent: number;
    };
    /**
     * Create accessible pagination
     */
    createAccessiblePagination(currentPage: number, totalPages: number, userId?: string): {
        label: string;
        description: string;
    };
    /**
     * Format numbers for accessibility
     */
    formatNumber(num: number, prefs?: AccessibilityOptions): string;
    /**
     * Format dates for accessibility
     */
    formatDate(date: Date, prefs?: AccessibilityOptions): string;
    /**
     * Create accessible progress bar
     */
    createAccessibleProgressBar(current: number, total: number, prefs?: AccessibilityOptions): string;
    /**
     * Validate component accessibility
     */
    validateComponentAccessibility(component: {
        type: string;
        label?: string;
        customId?: string;
    }): {
        valid: boolean;
        issues: string[];
    };
    /**
     * Get recommended accessibility improvements
     */
    getAccessibilityRecommendations(): string[];
    /**
     * Create accessible error message
     */
    createAccessibleErrorMessage(error: string, userId?: string): {
        title: string;
        description: string;
    };
    /**
     * Create accessible success message
     */
    createAccessibleSuccessMessage(message: string, userId?: string): {
        title: string;
        description: string;
    };
    /**
     * Reset user preferences
     */
    resetUserPreferences(userId: string): void;
    /**
     * Export user preferences
     */
    exportUserPreferences(userId: string): AccessibilityOptions | null;
    /**
     * Import user preferences
     */
    importUserPreferences(userId: string, preferences: AccessibilityOptions): void;
}
export declare const accessibilityService: AccessibilityService;
export default accessibilityService;
//# sourceMappingURL=AccessibilityService.d.ts.map