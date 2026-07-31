/**
 * ═══════════════════════════════════════════════════
 *  Panindigan Premium Loading Handler
 *  Professional loading states with progress updates
 * ═══════════════════════════════════════════════════
 */
import { Message, } from 'discord.js';
import { EmbedManager } from '../structures/EmbedManager.js';
// ─── Loading Handler Class ────────────────────────────────────────────────────────
export class LoadingHandler {
    /**
     * Send loading response with professional formatting
     */
    static async send(source, options) {
        const { action, description, progress = 0, total = 100, current = 'Initializing...', showTimestamp = true, ephemeral = true, } = options;
        const embed = EmbedManager.loading(action, description);
        const percentage = Math.round((progress / total) * 100);
        const progressBar = this.createProgressBar(percentage);
        embed.addFields({
            name: '📊 Progress',
            value: `${progressBar} ${percentage}%`,
            inline: false,
        }, {
            name: '📋 Current Task',
            value: current,
            inline: false,
        });
        if (!showTimestamp) {
            embed.setTimestamp(null);
        }
        if (source instanceof Message) {
            return await source.reply({ embeds: [embed] });
        }
        else {
            await source.deferReply({ ephemeral });
            await source.editReply({ embeds: [embed] });
            return await source.fetchReply();
        }
    }
    /**
     * Update loading state with new progress
     */
    static async update(state, progress, current) {
        state.progress = progress;
        if (current)
            state.current = current;
        const percentage = Math.round((progress / state.total) * 100);
        const progressBar = this.createProgressBar(percentage);
        const embed = EmbedManager.loading(state.action);
        embed.addFields({
            name: '📊 Progress',
            value: `${progressBar} ${percentage}%`,
            inline: false,
        }, {
            name: '📋 Current Task',
            value: state.current,
            inline: false,
        });
        await state.message.edit({ embeds: [embed] });
    }
    /**
     * Complete loading state with success
     */
    static async complete(state, successMessage) {
        const embed = EmbedManager.success('Complete', successMessage);
        embed.addFields({
            name: '📊 Progress',
            value: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 100%',
            inline: false,
        });
        await state.message.edit({ embeds: [embed] });
    }
    /**
     * Fail loading state with error
     */
    static async fail(state, errorMessage) {
        const embed = EmbedManager.error('Failed', errorMessage);
        embed.addFields({
            name: '📊 Progress',
            value: `${this.createProgressBar(Math.round((state.progress / state.total) * 100))} ${Math.round((state.progress / state.total) * 100)}%`,
            inline: false,
        });
        await state.message.edit({ embeds: [embed] });
    }
    /**
     * Create progress bar
     */
    static createProgressBar(percentage) {
        const filled = Math.round(percentage / 10);
        const empty = 10 - filled;
        return '▬'.repeat(filled) + '🔘' + '▬'.repeat(empty);
    }
    /**
     * Create loading state for tracking
     */
    static createState(message, action, total = 100) {
        return {
            message,
            action,
            progress: 0,
            total,
            current: 'Initializing...',
        };
    }
    /**
     * Send music loading
     */
    static async music(source, trackName, action) {
        const actionMessages = {
            searching: 'Searching for track...',
            loading: 'Loading track...',
            processing: 'Processing audio...',
        };
        return await this.send(source, {
            action: 'Music',
            description: `${actionMessages[action]} "${trackName}"`,
            current: actionMessages[action],
        });
    }
    /**
     * Send AI processing loading
     */
    static async ai(source, model, prompt) {
        return await this.send(source, {
            action: 'AI Processing',
            description: `Processing your request with ${model}...`,
            current: 'Analyzing prompt...',
        });
    }
    /**
     * Send database operation loading
     */
    static async database(source, operation) {
        const operationMessages = {
            saving: 'Saving data...',
            loading: 'Loading data...',
            updating: 'Updating data...',
            deleting: 'Deleting data...',
        };
        return await this.send(source, {
            action: 'Database',
            description: operationMessages[operation],
            current: operationMessages[operation],
        });
    }
    /**
     * Send image generation loading
     */
    static async image(source, prompt) {
        return await this.send(source, {
            action: 'Image Generation',
            description: `Generating image for "${prompt}"...`,
            current: 'Initializing AI model...',
        });
    }
    /**
     * Send playlist loading
     */
    static async playlist(source, playlistName, songCount) {
        return await this.send(source, {
            action: 'Playlist',
            description: `Loading playlist "${playlistName}" with ${songCount} songs...`,
            current: 'Fetching track information...',
            total: songCount,
        });
    }
    /**
     * Send moderation action loading
     */
    static async moderation(source, action, target) {
        return await this.send(source, {
            action: 'Moderation',
            description: `${action} ${target}...`,
            current: 'Processing action...',
        });
    }
    /**
     * Send economy transaction loading
     */
    static async economy(source, action, amount) {
        return await this.send(source, {
            action: 'Economy',
            description: `${action} ₱${amount.toLocaleString()}...`,
            current: 'Processing transaction...',
        });
    }
    /**
     * Send bulk operation loading
     */
    static async bulk(source, operation, total) {
        return await this.send(source, {
            action: 'Bulk Operation',
            description: `${operation} ${total} items...`,
            current: 'Starting operation...',
            total,
        });
    }
    /**
     * Send API request loading
     */
    static async api(source, endpoint) {
        return await this.send(source, {
            action: 'API Request',
            description: `Making request to ${endpoint}...`,
            current: 'Connecting to API...',
        });
    }
    /**
     * Send generic loading with custom message
     */
    static async generic(source, message) {
        return await this.send(source, {
            action: 'Processing',
            description: message,
            current: 'Working on it...',
        });
    }
}
// ─── Export Loading Handler ─────────────────────────────────────────────────────────
export default LoadingHandler;
//# sourceMappingURL=LoadingHandler.js.map