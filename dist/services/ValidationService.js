// @ts-nocheck
import { ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { getPrismaClient } from '../database/postgresql/client.js';
import { getCooldown, setCooldown } from '../database/redis/client.js';
class ValidationService {
    prisma = getPrismaClient();
    async validateInteraction(interaction, options = {}) {
        // Check guild requirement
        if (options.requireGuild && !interaction.guild) {
            return { valid: false, error: 'This command can only be used in a server.' };
        }
        // Check blacklist
        if (options.checkBlacklist) {
            const blacklistCheck = await this.checkBlacklist(interaction);
            if (!blacklistCheck.valid)
                return blacklistCheck;
        }
        // Check premium requirement
        if (options.requirePremium) {
            const premiumCheck = await this.checkPremium(interaction, options.requirePremium);
            if (!premiumCheck.valid)
                return premiumCheck;
        }
        // Check cooldown
        if (options.cooldown) {
            const cooldownCheck = await this.checkCooldown(interaction, options.cooldown);
            if (!cooldownCheck.valid)
                return cooldownCheck;
        }
        // Check voice requirements
        if (options.requireVoice || options.requireSameVoice) {
            const voiceCheck = await this.checkVoice(interaction, options);
            if (!voiceCheck.valid)
                return voiceCheck;
        }
        // Check user permissions
        if (options.requirePermissions?.length) {
            const permCheck = this.checkPermissions(interaction, options.requirePermissions);
            if (!permCheck.valid)
                return permCheck;
        }
        // Check bot permissions
        if (options.requireBotPermissions?.length) {
            const botPermCheck = await this.checkBotPermissions(interaction, options.requireBotPermissions);
            if (!botPermCheck.valid)
                return botPermCheck;
        }
        return { valid: true };
    }
    async checkBlacklist(interaction) {
        try {
            const userId = interaction.user.id;
            const guildId = interaction.guild?.id;
            // Check global blacklist
            const globalBlacklist = await this.prisma.blacklist.findUnique({
                where: { userId },
            });
            if (globalBlacklist) {
                return { valid: false, error: 'You are globally blacklisted from using this bot.' };
            }
            // Check guild blacklist
            if (guildId) {
                const guildBlacklist = await this.prisma.guildBlacklist.findFirst({
                    where: { userId, guildId },
                });
                if (guildBlacklist) {
                    return { valid: false, error: 'You are blacklisted from this server.' };
                }
            }
            return { valid: true };
        }
        catch (error) {
            return { valid: false, error: 'Failed to check blacklist status.' };
        }
    }
    async checkPremium(interaction, requiredTier) {
        try {
            const userId = interaction.user.id;
            const premium = await this.prisma.premium.findUnique({
                where: { userId },
            });
            if (!premium) {
                if (requiredTier === 'free')
                    return { valid: true };
                return { valid: false, error: 'This feature requires a premium subscription.' };
            }
            const tierHierarchy = ['free', 'bronze', 'silver', 'gold', 'diamond'];
            const userTierIndex = tierHierarchy.indexOf(premium.tier);
            const requiredTierIndex = tierHierarchy.indexOf(requiredTier);
            if (userTierIndex < requiredTierIndex) {
                return { valid: false, error: `This feature requires ${requiredTier} tier or higher.` };
            }
            return { valid: true };
        }
        catch (error) {
            return { valid: false, error: 'Failed to check premium status.' };
        }
    }
    async checkCooldown(interaction, cooldownSeconds) {
        try {
            const userId = interaction.user.id;
            const guildId = interaction.guild?.id || 'dm';
            const commandName = interaction instanceof ChatInputCommandInteraction
                ? interaction.commandName
                : interaction.content.split(' ')[0].replace('!', '');
            const remaining = await getCooldown(userId, guildId, commandName);
            if (remaining > 0) {
                return {
                    valid: false,
                    error: `Please wait ${remaining} seconds before using this command again.`,
                };
            }
            await setCooldown(userId, guildId, commandName, cooldownSeconds);
            return { valid: true };
        }
        catch (error) {
            return { valid: false, error: 'Failed to check cooldown.' };
        }
    }
    async checkVoice(interaction, options) {
        const member = interaction.member;
        if (!member) {
            return { valid: false, error: 'You must be a member to use voice commands.' };
        }
        const voiceChannel = member.voice.channel;
        if (options.requireVoice && !voiceChannel) {
            return { valid: false, error: 'You must be in a voice channel to use this command.' };
        }
        if (options.requireSameVoice && voiceChannel) {
            const client = interaction.client;
            const guild = interaction.guild;
            if (!guild)
                return { valid: false, error: 'This command can only be used in a server.' };
            const botMember = guild.members.me;
            if (!botMember)
                return { valid: false, error: 'Bot member not found.' };
            const botVoiceChannel = botMember.voice.channel;
            if (botVoiceChannel && botVoiceChannel.id !== voiceChannel.id) {
                return { valid: false, error: 'You must be in the same voice channel as the bot.' };
            }
        }
        return { valid: true };
    }
    checkPermissions(interaction, requiredPermissions) {
        const member = interaction.member;
        if (!member) {
            return { valid: false, error: 'You must be a member to use this command.' };
        }
        const missingPermissions = requiredPermissions.filter(perm => !member.permissions.has(perm));
        if (missingPermissions.length > 0) {
            const permNames = missingPermissions.map(p => Object.keys(PermissionFlagsBits).find(key => PermissionFlagsBits[key] === p)).join(', ');
            return { valid: false, error: `You need the following permissions: ${permNames}` };
        }
        return { valid: true };
    }
    async checkBotPermissions(interaction, requiredPermissions) {
        const guild = interaction.guild;
        if (!guild) {
            return { valid: false, error: 'This command can only be used in a server.' };
        }
        const botMember = guild.members.me;
        if (!botMember) {
            return { valid: false, error: 'Bot member not found.' };
        }
        const missingPermissions = requiredPermissions.filter(perm => !botMember.permissions.has(perm));
        if (missingPermissions.length > 0) {
            const permNames = missingPermissions.map(p => Object.keys(PermissionFlagsBits).find(key => PermissionFlagsBits[key] === p)).join(', ');
            return { valid: false, error: `I need the following permissions: ${permNames}` };
        }
        return { valid: true };
    }
    async validateMusicPlayer(interaction) {
        const voiceCheck = await this.checkVoice(interaction, { requireVoice: true, requireSameVoice: true });
        if (!voiceCheck.valid)
            return voiceCheck;
        const member = interaction.member;
        const voiceChannel = member.voice.channel;
        if (!voiceChannel.joinable) {
            return { valid: false, error: 'I cannot join your voice channel.' };
        }
        if (!voiceChannel.speakable) {
            return { valid: false, error: 'I cannot speak in your voice channel.' };
        }
        return { valid: true, data: { voiceChannel } };
    }
    async validateModerationAction(interaction, targetUser) {
        const member = interaction.member;
        if (!member)
            return { valid: false, error: 'You must be a member to perform moderation actions.' };
        // Check if target is higher in hierarchy
        if (targetUser.roles.highest.position >= member.roles.highest.position) {
            return { valid: false, error: 'You cannot moderate someone with equal or higher role position.' };
        }
        // Check if bot is higher in hierarchy
        const botMember = interaction.guild.members.me;
        if (targetUser.roles.highest.position >= botMember.roles.highest.position) {
            return { valid: false, error: 'I cannot moderate someone with equal or higher role position than me.' };
        }
        return { valid: true };
    }
    async validateEconomyTransaction(interaction, amount) {
        if (amount <= 0) {
            return { valid: false, error: 'Amount must be greater than 0.' };
        }
        try {
            const economy = await this.prisma.economy.findUnique({
                where: { userId: interaction.user.id },
            });
            if (!economy) {
                return { valid: false, error: 'You do not have an economy account.' };
            }
            if (economy.wallet < amount) {
                return { valid: false, error: 'You do not have enough coins in your wallet.' };
            }
            return { valid: true, data: { economy } };
        }
        catch (error) {
            return { valid: false, error: 'Failed to check economy balance.' };
        }
    }
    async validateInput(input, type = 'text') {
        switch (type) {
            case 'url':
                try {
                    new URL(input);
                    return { valid: true };
                }
                catch {
                    return { valid: false, error: 'Invalid URL format.' };
                }
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(input)) {
                    return { valid: false, error: 'Invalid email format.' };
                }
                return { valid: true };
            case 'number':
                if (isNaN(Number(input))) {
                    return { valid: false, error: 'Invalid number format.' };
                }
                return { valid: true };
            case 'text':
                if (input.length === 0) {
                    return { valid: false, error: 'Input cannot be empty.' };
                }
                if (input.length > 1000) {
                    return { valid: false, error: 'Input is too long (max 1000 characters).' };
                }
                return { valid: true };
        }
    }
}
export const validationService = new ValidationService();
export default validationService;
//# sourceMappingURL=ValidationService.js.map