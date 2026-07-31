/**
 * ═══════════════════════════════════════════════════
 *  Panindigan Bot Design System  v2
 *  Consistent colors, typography, and design tokens
 *  Fixed duplicate keys · Progress bar helpers
 * ═══════════════════════════════════════════════════
 */
export declare const COLORS: {
    readonly primary: 5793266;
    readonly secondary: 5763719;
    readonly danger: 15548997;
    readonly warning: 16705372;
    readonly info: 5793266;
    readonly success: 5763719;
    readonly music: 15418782;
    readonly economy: 15844367;
    readonly moderation: 15158332;
    readonly fun: 16739179;
    readonly games: 3066993;
    readonly ai: 44469;
    readonly social: 1752220;
    readonly utility: 9807270;
    readonly owner: 1120295;
    readonly premium: 16766720;
    readonly white: 16777215;
    readonly light: 15987958;
    readonly gray: 10265519;
    readonly dark: 2042167;
    readonly black: 0;
};
export declare const TYPOGRAPHY: {
    readonly sizes: {
        readonly xs: 0.75;
        readonly sm: 0.875;
        readonly base: 1;
        readonly lg: 1.125;
        readonly xl: 1.25;
        readonly '2xl': 1.5;
        readonly '3xl': 1.875;
    };
    readonly weights: {
        readonly normal: 400;
        readonly medium: 500;
        readonly semibold: 600;
        readonly bold: 700;
    };
    readonly lineHeights: {
        readonly tight: 1.25;
        readonly normal: 1.5;
        readonly relaxed: 1.75;
    };
};
export declare const SPACING: {
    readonly xs: 4;
    readonly sm: 8;
    readonly md: 16;
    readonly lg: 24;
    readonly xl: 32;
    readonly '2xl': 48;
    readonly '3xl': 64;
};
export declare const BORDER_RADIUS: {
    readonly none: 0;
    readonly sm: 4;
    readonly md: 8;
    readonly lg: 12;
    readonly xl: 16;
    readonly full: 9999;
};
export declare const SHADOWS: {
    readonly sm: "0 1px 2px 0 rgba(0,0,0,0.05)";
    readonly md: "0 4px 6px -1px rgba(0,0,0,0.1)";
    readonly lg: "0 10px 15px -3px rgba(0,0,0,0.1)";
    readonly xl: "0 20px 25px -5px rgba(0,0,0,0.1)";
};
export declare const ANIMATION: {
    readonly fast: 150;
    readonly normal: 300;
    readonly slow: 500;
};
export declare const EMBED_LIMITS: {
    readonly title: 256;
    readonly description: 4096;
    readonly fields: 25;
    readonly fieldName: 256;
    readonly fieldValue: 1024;
    readonly footer: 2048;
    readonly author: 256;
    readonly total: 6000;
};
export declare const BUTTON_STYLES: {
    readonly primary: {
        readonly style: "Primary";
        readonly emoji: "🔵";
    };
    readonly secondary: {
        readonly style: "Secondary";
        readonly emoji: "⚪";
    };
    readonly success: {
        readonly style: "Success";
        readonly emoji: "✅";
    };
    readonly danger: {
        readonly style: "Danger";
        readonly emoji: "❌";
    };
    readonly link: {
        readonly style: "Link";
        readonly emoji: "🔗";
    };
};
export declare const MESSAGES: {
    readonly success: (message: string) => string;
    readonly error: (message: string) => string;
    readonly warning: (message: string) => string;
    readonly info: (message: string) => string;
    readonly loading: (message: string) => string;
    readonly missingPermissions: "You do not have the required permissions to use this command.";
    readonly botMissingPermissions: "The bot does not have the required permissions to perform this action.";
    readonly cooldown: (seconds: number) => string;
    readonly rateLimit: (seconds: number) => string;
    readonly genericError: "Something went wrong. Please try again later.";
    readonly notFound: (resource: string) => string;
    readonly operationSuccess: "Operation completed successfully.";
    readonly operationCancelled: "Operation cancelled.";
};
/**
 * Build a premium progress bar string.
 *  filled: '█', empty: '░', 12 segments by default.
 */
export declare function buildProgressBar(value: number, max: number, length?: number): string;
/** Compact loading bar used in LoadingHandler (15 chars wide, shows current step marker). */
export declare function buildLoadingBar(step: number, total: number): string;
export declare const EMOJI_CATEGORIES: {
    readonly admin: "admin";
    readonly ai: "ai";
    readonly applications: "applications";
    readonly context: "context";
    readonly economy: "economy";
    readonly fun: "fun";
    readonly games: "games";
    readonly giveaway: "giveaway";
    readonly help: "help";
    readonly image: "image";
    readonly info: "info";
    readonly leveling: "leveling";
    readonly moderation: "moderation";
    readonly music: "music";
    readonly owner: "owner";
    readonly premium: "premium";
    readonly social: "social";
    readonly starboard: "starboard";
    readonly utility: "utility";
};
export declare const COMPONENT_LABELS: {
    readonly previousPage: "◀️ Previous";
    readonly nextPage: "▶️ Next";
    readonly firstPage: "⏮️ First";
    readonly lastPage: "⏭️ Last";
    readonly page: (current: number, total: number) => string;
    readonly confirm: "✅ Confirm";
    readonly cancel: "❌ Cancel";
    readonly dismiss: "✖️ Dismiss";
    readonly delete: "🗑️ Delete";
    readonly edit: "✏️ Edit";
    readonly view: "👁️ View";
    readonly refresh: "🔄 Refresh";
    readonly close: "❌ Close";
    readonly play: "▶️ Play";
    readonly pause: "⏸️ Pause";
    readonly resume: "▶️ Resume";
    readonly stop: "⏹️ Stop";
    readonly skip: "⏭️ Skip";
    readonly previous: "⏮️ Previous";
    readonly shuffle: "🔀 Shuffle";
    readonly loop: "🔁 Loop";
    readonly volume: "🔊 Volume";
    readonly queue: "📜 Queue";
    readonly lyrics: "🎵 Lyrics";
    readonly ban: "🔨 Ban";
    readonly kick: "👢 Kick";
    readonly mute: "🔇 Mute";
    readonly unmute: "🔊 Unmute";
    readonly warn: "⚠️ Warn";
    readonly lock: "🔒 Lock";
    readonly unlock: "🔓 Unlock";
    readonly deposit: "💰 Deposit";
    readonly withdraw: "🏦 Withdraw";
    readonly transfer: "💸 Transfer";
    readonly balance: "👛 Balance";
    readonly yes: "✅ Yes";
    readonly no: "❌ No";
    readonly maybe: "❓ Maybe";
    readonly back: "◀️ Back";
    readonly home: "🏠 Home";
    readonly help: "ℹ️ Help";
};
export declare const EMBED_TEMPLATES: {
    readonly standard: {
        readonly color: 5793266;
        readonly timestamp: true;
        readonly footer: {
            readonly text: "✨ Panindigan";
        };
    };
    readonly success: {
        readonly color: 5763719;
        readonly timestamp: true;
    };
    readonly error: {
        readonly color: 15548997;
        readonly timestamp: true;
    };
    readonly warning: {
        readonly color: 16705372;
        readonly timestamp: true;
    };
    readonly info: {
        readonly color: 5793266;
        readonly timestamp: true;
    };
    readonly music: {
        readonly color: 15418782;
        readonly timestamp: true;
    };
    readonly economy: {
        readonly color: 15844367;
        readonly timestamp: true;
    };
    readonly moderation: {
        readonly color: 15158332;
        readonly timestamp: true;
    };
    readonly premium: {
        readonly color: 16766720;
        readonly timestamp: true;
    };
};
export declare const VALIDATION: {
    readonly username: {
        readonly minLength: 2;
        readonly maxLength: 32;
        readonly pattern: RegExp;
    };
    readonly message: {
        readonly minLength: 1;
        readonly maxLength: 4000;
    };
    readonly argument: {
        readonly minLength: 1;
        readonly maxLength: 100;
    };
    readonly url: {
        readonly pattern: RegExp;
    };
    readonly number: {
        readonly min: 0;
        readonly max: number;
    };
};
export declare const PAGINATION: {
    readonly defaultItemsPerPage: 10;
    readonly maxItemsPerPage: 25;
    readonly maxPages: 100;
};
export declare const RATE_LIMITS: {
    readonly global: {
        readonly requests: 50;
        readonly window: 60;
    };
    readonly user: {
        readonly requests: 10;
        readonly window: 60;
    };
    readonly command: {
        readonly requests: 5;
        readonly window: 60;
    };
};
export declare const CACHE: {
    readonly defaultTTL: 3600;
    readonly user: 1800;
    readonly guild: 3600;
    readonly economy: 300;
    readonly music: 600;
    readonly api: 1800;
};
export declare const ACCESSIBILITY: {
    readonly contrastRatios: {
        readonly normal: 4.5;
        readonly large: 3;
    };
    readonly minTapTarget: 44;
    readonly descriptions: {
        readonly button: (label: string) => string;
        readonly link: (label: string) => string;
        readonly image: (alt: string) => string;
    };
};
export declare const DESIGN_SYSTEM: {
    readonly COLORS: {
        readonly primary: 5793266;
        readonly secondary: 5763719;
        readonly danger: 15548997;
        readonly warning: 16705372;
        readonly info: 5793266;
        readonly success: 5763719;
        readonly music: 15418782;
        readonly economy: 15844367;
        readonly moderation: 15158332;
        readonly fun: 16739179;
        readonly games: 3066993;
        readonly ai: 44469;
        readonly social: 1752220;
        readonly utility: 9807270;
        readonly owner: 1120295;
        readonly premium: 16766720;
        readonly white: 16777215;
        readonly light: 15987958;
        readonly gray: 10265519;
        readonly dark: 2042167;
        readonly black: 0;
    };
    readonly TYPOGRAPHY: {
        readonly sizes: {
            readonly xs: 0.75;
            readonly sm: 0.875;
            readonly base: 1;
            readonly lg: 1.125;
            readonly xl: 1.25;
            readonly '2xl': 1.5;
            readonly '3xl': 1.875;
        };
        readonly weights: {
            readonly normal: 400;
            readonly medium: 500;
            readonly semibold: 600;
            readonly bold: 700;
        };
        readonly lineHeights: {
            readonly tight: 1.25;
            readonly normal: 1.5;
            readonly relaxed: 1.75;
        };
    };
    readonly SPACING: {
        readonly xs: 4;
        readonly sm: 8;
        readonly md: 16;
        readonly lg: 24;
        readonly xl: 32;
        readonly '2xl': 48;
        readonly '3xl': 64;
    };
    readonly BORDER_RADIUS: {
        readonly none: 0;
        readonly sm: 4;
        readonly md: 8;
        readonly lg: 12;
        readonly xl: 16;
        readonly full: 9999;
    };
    readonly SHADOWS: {
        readonly sm: "0 1px 2px 0 rgba(0,0,0,0.05)";
        readonly md: "0 4px 6px -1px rgba(0,0,0,0.1)";
        readonly lg: "0 10px 15px -3px rgba(0,0,0,0.1)";
        readonly xl: "0 20px 25px -5px rgba(0,0,0,0.1)";
    };
    readonly ANIMATION: {
        readonly fast: 150;
        readonly normal: 300;
        readonly slow: 500;
    };
    readonly EMBED_LIMITS: {
        readonly title: 256;
        readonly description: 4096;
        readonly fields: 25;
        readonly fieldName: 256;
        readonly fieldValue: 1024;
        readonly footer: 2048;
        readonly author: 256;
        readonly total: 6000;
    };
    readonly BUTTON_STYLES: {
        readonly primary: {
            readonly style: "Primary";
            readonly emoji: "🔵";
        };
        readonly secondary: {
            readonly style: "Secondary";
            readonly emoji: "⚪";
        };
        readonly success: {
            readonly style: "Success";
            readonly emoji: "✅";
        };
        readonly danger: {
            readonly style: "Danger";
            readonly emoji: "❌";
        };
        readonly link: {
            readonly style: "Link";
            readonly emoji: "🔗";
        };
    };
    readonly MESSAGES: {
        readonly success: (message: string) => string;
        readonly error: (message: string) => string;
        readonly warning: (message: string) => string;
        readonly info: (message: string) => string;
        readonly loading: (message: string) => string;
        readonly missingPermissions: "You do not have the required permissions to use this command.";
        readonly botMissingPermissions: "The bot does not have the required permissions to perform this action.";
        readonly cooldown: (seconds: number) => string;
        readonly rateLimit: (seconds: number) => string;
        readonly genericError: "Something went wrong. Please try again later.";
        readonly notFound: (resource: string) => string;
        readonly operationSuccess: "Operation completed successfully.";
        readonly operationCancelled: "Operation cancelled.";
    };
    readonly EMOJI_CATEGORIES: {
        readonly admin: "admin";
        readonly ai: "ai";
        readonly applications: "applications";
        readonly context: "context";
        readonly economy: "economy";
        readonly fun: "fun";
        readonly games: "games";
        readonly giveaway: "giveaway";
        readonly help: "help";
        readonly image: "image";
        readonly info: "info";
        readonly leveling: "leveling";
        readonly moderation: "moderation";
        readonly music: "music";
        readonly owner: "owner";
        readonly premium: "premium";
        readonly social: "social";
        readonly starboard: "starboard";
        readonly utility: "utility";
    };
    readonly COMPONENT_LABELS: {
        readonly previousPage: "◀️ Previous";
        readonly nextPage: "▶️ Next";
        readonly firstPage: "⏮️ First";
        readonly lastPage: "⏭️ Last";
        readonly page: (current: number, total: number) => string;
        readonly confirm: "✅ Confirm";
        readonly cancel: "❌ Cancel";
        readonly dismiss: "✖️ Dismiss";
        readonly delete: "🗑️ Delete";
        readonly edit: "✏️ Edit";
        readonly view: "👁️ View";
        readonly refresh: "🔄 Refresh";
        readonly close: "❌ Close";
        readonly play: "▶️ Play";
        readonly pause: "⏸️ Pause";
        readonly resume: "▶️ Resume";
        readonly stop: "⏹️ Stop";
        readonly skip: "⏭️ Skip";
        readonly previous: "⏮️ Previous";
        readonly shuffle: "🔀 Shuffle";
        readonly loop: "🔁 Loop";
        readonly volume: "🔊 Volume";
        readonly queue: "📜 Queue";
        readonly lyrics: "🎵 Lyrics";
        readonly ban: "🔨 Ban";
        readonly kick: "👢 Kick";
        readonly mute: "🔇 Mute";
        readonly unmute: "🔊 Unmute";
        readonly warn: "⚠️ Warn";
        readonly lock: "🔒 Lock";
        readonly unlock: "🔓 Unlock";
        readonly deposit: "💰 Deposit";
        readonly withdraw: "🏦 Withdraw";
        readonly transfer: "💸 Transfer";
        readonly balance: "👛 Balance";
        readonly yes: "✅ Yes";
        readonly no: "❌ No";
        readonly maybe: "❓ Maybe";
        readonly back: "◀️ Back";
        readonly home: "🏠 Home";
        readonly help: "ℹ️ Help";
    };
    readonly EMBED_TEMPLATES: {
        readonly standard: {
            readonly color: 5793266;
            readonly timestamp: true;
            readonly footer: {
                readonly text: "✨ Panindigan";
            };
        };
        readonly success: {
            readonly color: 5763719;
            readonly timestamp: true;
        };
        readonly error: {
            readonly color: 15548997;
            readonly timestamp: true;
        };
        readonly warning: {
            readonly color: 16705372;
            readonly timestamp: true;
        };
        readonly info: {
            readonly color: 5793266;
            readonly timestamp: true;
        };
        readonly music: {
            readonly color: 15418782;
            readonly timestamp: true;
        };
        readonly economy: {
            readonly color: 15844367;
            readonly timestamp: true;
        };
        readonly moderation: {
            readonly color: 15158332;
            readonly timestamp: true;
        };
        readonly premium: {
            readonly color: 16766720;
            readonly timestamp: true;
        };
    };
    readonly VALIDATION: {
        readonly username: {
            readonly minLength: 2;
            readonly maxLength: 32;
            readonly pattern: RegExp;
        };
        readonly message: {
            readonly minLength: 1;
            readonly maxLength: 4000;
        };
        readonly argument: {
            readonly minLength: 1;
            readonly maxLength: 100;
        };
        readonly url: {
            readonly pattern: RegExp;
        };
        readonly number: {
            readonly min: 0;
            readonly max: number;
        };
    };
    readonly PAGINATION: {
        readonly defaultItemsPerPage: 10;
        readonly maxItemsPerPage: 25;
        readonly maxPages: 100;
    };
    readonly RATE_LIMITS: {
        readonly global: {
            readonly requests: 50;
            readonly window: 60;
        };
        readonly user: {
            readonly requests: 10;
            readonly window: 60;
        };
        readonly command: {
            readonly requests: 5;
            readonly window: 60;
        };
    };
    readonly CACHE: {
        readonly defaultTTL: 3600;
        readonly user: 1800;
        readonly guild: 3600;
        readonly economy: 300;
        readonly music: 600;
        readonly api: 1800;
    };
    readonly ACCESSIBILITY: {
        readonly contrastRatios: {
            readonly normal: 4.5;
            readonly large: 3;
        };
        readonly minTapTarget: 44;
        readonly descriptions: {
            readonly button: (label: string) => string;
            readonly link: (label: string) => string;
            readonly image: (alt: string) => string;
        };
    };
    readonly buildProgressBar: typeof buildProgressBar;
    readonly buildLoadingBar: typeof buildLoadingBar;
};
export default DESIGN_SYSTEM;
//# sourceMappingURL=DesignSystem.d.ts.map