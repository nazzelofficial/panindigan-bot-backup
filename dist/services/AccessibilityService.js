// @ts-nocheck
import { EmbedBuilder } from 'discord.js';
import { DESIGN_SYSTEM } from '../constants/DesignSystem.js';
class AccessibilityService {
    userPreferences = new Map();
    /**
     * Set user accessibility preferences
     */
    setUserPreferences(userId, preferences) {
        this.userPreferences.set(userId, preferences);
    }
    /**
     * Get user accessibility preferences
     */
    getUserPreferences(userId) {
        return this.userPreferences.get(userId) || {
            screenReaderFriendly: false,
            highContrast: false,
            reducedMotion: false,
            largeText: false,
            theme: 'auto',
        };
    }
    /**
     * Create an accessible embed with proper contrast and descriptions
     */
    createAccessibleEmbed(options, accessibility) {
        const prefs = accessibility || (options.userId ? this.getUserPreferences(options.userId) : {});
        const embed = new EmbedBuilder()
            .setTitle(options.title)
            .setDescription(this.formatForAccessibility(options.description, prefs))
            .setColor(this.getAccessibleColor(options.color || DESIGN_SYSTEM.COLORS.primary, prefs));
        // Add screen reader friendly footer
        if (prefs.screenReaderFriendly) {
            embed.setFooter({ text: 'Screen reader friendly mode enabled' });
        }
        return embed;
    }
    /**
     * Format text for accessibility
     */
    formatForAccessibility(text, prefs) {
        let formatted = text;
        // Add spacing for large text
        if (prefs.largeText) {
            formatted = formatted.replace(/\n/g, '\n\n');
        }
        // Simplify formatting for screen readers
        if (prefs.screenReaderFriendly) {
            formatted = formatted.replace(/\*\*/g, '')
                .replace(/~~/g, '')
                .replace(/`/g, '');
        }
        return formatted;
    }
    /**
     * Get accessible color with proper contrast
     */
    getAccessibleColor(color, prefs) {
        if (prefs.highContrast) {
            // Return high contrast colors
            return DESIGN_SYSTEM.COLORS.primary;
        }
        return color;
    }
    /**
     * Create responsive embed for mobile/desktop
     */
    createResponsiveEmbed(options) {
        const embed = new EmbedBuilder()
            .setTitle(options.title)
            .setColor(options.color || DESIGN_SYSTEM.COLORS.primary);
        // Adjust description length for mobile
        if (options.mobile) {
            const maxLength = 500;
            const truncated = options.description.length > maxLength
                ? options.description.substring(0, maxLength) + '...'
                : options.description;
            embed.setDescription(truncated);
        }
        else {
            embed.setDescription(options.description);
        }
        // Adjust fields for compact mode
        if (options.compact && options.fields) {
            const compactFields = options.fields.slice(0, 3);
            embed.addFields(compactFields);
        }
        else if (options.fields) {
            embed.addFields(options.fields);
        }
        return embed;
    }
    /**
     * Create accessible button labels
     */
    getAccessibleLabel(label, context) {
        // Add context for screen readers
        return `${label} (${context})`;
    }
    /**
     * Check if embed meets accessibility standards
     */
    validateEmbedAccessibility(embed) {
        const issues = [];
        const data = embed.toJSON();
        // Check title length
        if (data.title && data.title.length > 256) {
            issues.push('Title exceeds 256 characters');
        }
        // Check description length
        if (data.description && data.description.length > 4096) {
            issues.push('Description exceeds 4096 characters');
        }
        // Check field count
        if (data.fields && data.fields.length > 25) {
            issues.push('Too many fields (max 25)');
        }
        // Check for proper color contrast (simplified)
        if (data.color && data.color === 0) {
            issues.push('Embed has no color set');
        }
        return {
            valid: issues.length === 0,
            issues,
        };
    }
    /**
     * Get theme-appropriate colors
     */
    getThemeColors(theme) {
        const darkTheme = {
            background: 0x36393F,
            text: 0xDCDDDE,
            accent: 0x5865F2,
        };
        const lightTheme = {
            background: 0xFFFFFF,
            text: 0x000000,
            accent: 0x5865F2,
        };
        if (theme === 'dark')
            return darkTheme;
        if (theme === 'light')
            return lightTheme;
        return darkTheme; // Default to dark for auto
    }
    /**
     * Create accessible pagination
     */
    createAccessiblePagination(currentPage, totalPages, userId) {
        const prefs = userId ? this.getUserPreferences(userId) : {};
        const label = prefs.screenReaderFriendly
            ? `Page ${currentPage + 1} of ${totalPages}`
            : `${currentPage + 1}/${totalPages}`;
        const description = prefs.screenReaderFriendly
            ? `Currently viewing page ${currentPage + 1} out of ${totalPages} total pages`
            : '';
        return { label, description };
    }
    /**
     * Format numbers for accessibility
     */
    formatNumber(num, prefs) {
        if (prefs?.screenReaderFriendly) {
            return num.toLocaleString();
        }
        return num.toLocaleString();
    }
    /**
     * Format dates for accessibility
     */
    formatDate(date, prefs) {
        if (prefs?.screenReaderFriendly) {
            return date.toLocaleString();
        }
        return `<t:${Math.floor(date.getTime() / 1000)}:R>`;
    }
    /**
     * Create accessible progress bar
     */
    createAccessibleProgressBar(current, total, prefs) {
        const percentage = Math.round((current / total) * 100);
        if (prefs?.screenReaderFriendly) {
            return `${percentage}% complete (${current} of ${total})`;
        }
        const barLength = 20;
        const filled = Math.round((percentage / 100) * barLength);
        const empty = barLength - filled;
        return `${'█'.repeat(filled)}${'░'.repeat(empty)} ${percentage}%`;
    }
    /**
     * Validate component accessibility
     */
    validateComponentAccessibility(component) {
        const issues = [];
        if (!component.label && component.type !== 'Action Row') {
            issues.push('Component missing label');
        }
        if (component.label && component.label.length > 80) {
            issues.push('Label exceeds 80 characters');
        }
        if (!component.customId && component.type !== 'Action Row') {
            issues.push('Component missing custom ID');
        }
        return {
            valid: issues.length === 0,
            issues,
        };
    }
    /**
     * Get recommended accessibility improvements
     */
    getAccessibilityRecommendations() {
        return [
            'Use descriptive labels for all buttons and components',
            'Provide alt text for images',
            'Ensure color contrast meets WCAG AA standards (4.5:1 for normal text)',
            'Use semantic emoji with text descriptions',
            'Keep embed descriptions concise and clear',
            'Avoid using color as the only means of conveying information',
            'Provide keyboard navigation alternatives',
            'Use consistent formatting across all embeds',
            'Test with screen readers when possible',
            'Consider users with color blindness when choosing colors',
        ];
    }
    /**
     * Create accessible error message
     */
    createAccessibleErrorMessage(error, userId) {
        const prefs = userId ? this.getUserPreferences(userId) : {};
        const title = 'Error Occurred';
        const description = prefs.screenReaderFriendly
            ? `An error has occurred. ${error}`
            : error;
        return { title, description };
    }
    /**
     * Create accessible success message
     */
    createAccessibleSuccessMessage(message, userId) {
        const prefs = userId ? this.getUserPreferences(userId) : {};
        const title = 'Success';
        const description = prefs.screenReaderFriendly
            ? `Operation completed successfully. ${message}`
            : message;
        return { title, description };
    }
    /**
     * Reset user preferences
     */
    resetUserPreferences(userId) {
        this.userPreferences.delete(userId);
    }
    /**
     * Export user preferences
     */
    exportUserPreferences(userId) {
        return this.userPreferences.get(userId) || null;
    }
    /**
     * Import user preferences
     */
    importUserPreferences(userId, preferences) {
        this.userPreferences.set(userId, preferences);
    }
}
export const accessibilityService = new AccessibilityService();
export default accessibilityService;
//# sourceMappingURL=AccessibilityService.js.map