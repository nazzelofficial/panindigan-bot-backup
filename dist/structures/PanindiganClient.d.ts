/**
 * ══════════════════════════════════════════════════
 *  Panindigan Client
 *  Discord.js client + Kazagumo + DB init
 *  Metrics integration + auto-recovery music events
 * ══════════════════════════════════════════════════
 */
import { Client, Collection } from 'discord.js';
import { Kazagumo } from 'kazagumo';
import { BaseCommand } from './BaseCommand.js';
import { AIHandler } from '../handlers/AIHandler.js';
export declare class PanindiganClient extends Client {
    commands: Collection<string, BaseCommand>;
    cooldowns: Collection<string, Collection<string, number>>;
    kazagumo: Kazagumo | null;
    aiHandler: AIHandler;
    config: {
        configVersion: string;
        features: {
            music: boolean;
            ai: boolean;
            economy: boolean;
            leveling: boolean;
            moderation: boolean;
        };
        bot: {
            name: string;
            description: string;
            prefix: string;
            defaultLanguage: string;
            supportServerUrl: string;
            inviteUrl: string;
        };
        loader: {
            enablePrefixCommands: boolean;
            enableSlashCommands: boolean;
            recursive: boolean;
            extensions: string[];
            rejectDuplicateNames: boolean;
            validateOnStartup: boolean;
        };
        sharding: {
            enabled: boolean;
            strategy: string;
            shardCount: string;
            maxGuildsPerShard: number;
            respawn: boolean;
            spawnTimeoutMs: number;
            logPerShard: boolean;
        };
        presence: {
            enabled: boolean;
            perShard: boolean;
            updateIntervalSeconds: number;
            status: string;
            activities: {
                type: string;
                text: string;
            }[];
        };
        databases: {
            postgresql: {
                urlEnv: string;
                poolMin: number;
                poolMax: number;
                connectionTimeoutMs: number;
                idleTimeoutMs: number;
            };
            mongodb: {
                uriEnv: string;
                poolSize: number;
                connectTimeoutMs: number;
                collections: {
                    aiMemory: string;
                    tags: string;
                    logs: string;
                    analytics: string;
                };
            };
            redis: {
                urlEnv: string;
                keyPrefix: string;
                defaultTtlSeconds: number;
                cooldownTtlSeconds: number;
            };
        };
        premium: {
            tiers: {
                bronze: {
                    price: number;
                    currency: string;
                    billingCycle: string;
                    label: string;
                    description: string;
                };
                silver: {
                    price: number;
                    currency: string;
                    billingCycle: string;
                    label: string;
                    description: string;
                };
                gold: {
                    price: number;
                    currency: string;
                    billingCycle: string;
                    label: string;
                    description: string;
                };
                diamond: {
                    price: number;
                    currency: string;
                    billingCycle: string;
                    label: string;
                    description: string;
                };
            };
            trial: {
                enabled: boolean;
                durationDays: number;
                tier: string;
                oneTimePerUser: boolean;
                requiresAccount: boolean;
                description: string;
            };
        };
        moderation: {
            defaultMuteDuration: string;
            maxWarningsBeforeAction: number;
            warningActions: {
                "3": string;
                "5": string;
                "7": string;
                "10": string;
            };
            automodSensitivity: string;
            antispam: {
                threshold: number;
                intervalMs: number;
            };
            maxPurgeAmount: number;
            antiNuke: {
                enabled: boolean;
                banThreshold: number;
                kickThreshold: number;
                channelDeleteThreshold: number;
                roleDeleteThreshold: number;
                timeWindowSeconds: number;
            };
        };
        economy: {
            currencySymbol: string;
            currencyName: string;
            startingBalance: number;
            rewards: {
                daily: {
                    min: number;
                    max: number;
                };
                weekly: {
                    min: number;
                    max: number;
                };
                work: {
                    min: number;
                    max: number;
                };
            };
            cooldowns: {
                work: string;
                crime: string;
            };
            crimeSuccessRate: number;
            robSuccessRate: number;
            bankInterestRate: number;
            taxRate: number;
        };
        leveling: {
            enabled: boolean;
            xpPerMessage: {
                min: number;
                max: number;
            };
            xpCooldownSeconds: number;
            levelUpNotification: boolean;
            stackRoles: boolean;
            voiceXpPerMinute: number;
        };
        music: {
            defaultVolume: number;
            queueLimits: {
                default: number;
                gold: number;
                diamond: number;
            };
            maxSongDurationSeconds: number;
            inactivityTimeoutMs: number;
            sources: {
                youtube: boolean;
                spotify: boolean;
                soundcloud: boolean;
                appleMusic: boolean;
                deezer: boolean;
                tidal: boolean;
            };
            leaveOnEmpty: boolean;
            leaveOnEmptyCooldownMs: number;
        };
        ai: {
            providers: {
                primary: string;
                fallback: string[];
            };
            defaultModel: string;
            maxTokens: {
                default: number;
                diamond: number;
            };
            temperature: number;
            imageModel: string;
            imageSize: string;
            streamResponses: boolean;
            conversationMemoryMessages: {
                free: number;
                bronze: number;
                silver: number;
                gold: number;
                diamond: number;
            };
            dailyImageLimit: {
                free: number;
                bronze: number;
                silver: number;
                gold: number;
                diamond: number;
            };
            memoryStorage: string;
            systemPrompt: string;
        };
        cooldowns: {
            defaultSeconds: number;
            byCategorySeconds: {
                music: number;
                economy: number;
                ai: number;
                games: number;
                moderation: number;
                owner: number;
            };
            premiumMultipliers: {
                bronze: number;
                silver: number;
                gold: number;
                diamond: number;
            };
        };
        logging: {
            level: string;
            format: string;
            rotation: {
                enabled: boolean;
                maxFiles: string;
                maxSize: string;
            };
            auditOwnerCommands: boolean;
            mongodb: {
                enabled: boolean;
                collection: string;
            };
        };
        rateLimits: {
            commandsPerMinute: {
                default: number;
                bronze: number;
                silver: number;
                gold: number;
                diamond: number;
            };
            aiRequestsPerHour: {
                default: number;
                diamond: number;
            };
            musicSearchesPerMinute: number;
        };
        runtime: {
            maintenance: {
                enabled: boolean;
                message: string;
                allowOwner: boolean;
            };
            debug: boolean;
            betaFeatures: boolean;
        };
    };
    shardId: number;
    totalShards: number;
    private _presenceIndex;
    constructor(shardId?: number, totalShards?: number);
    initializeDatabases(): Promise<void>;
    initializeMusic(): Promise<void>;
    getOwnerIds(): string[];
    isOwner(userId: string): boolean;
    updatePresence(): Promise<void>;
}
//# sourceMappingURL=PanindiganClient.d.ts.map