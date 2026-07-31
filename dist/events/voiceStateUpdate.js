import { addVoiceXP } from '../handlers/LevelingHandler.js';
import { logger } from '../utils/Logger.js';
const voiceSessionStartTimes = new Map();
export const event = {
    name: 'voiceStateUpdate',
    once: false,
    async execute(oldState, newState, client) {
        const member = newState.member;
        if (!member)
            return;
        const userId = member.id;
        const guildId = member.guild.id;
        const key = `${userId}-${guildId}`;
        if (!oldState.channel && newState.channel) {
            voiceSessionStartTimes.set(key, Date.now());
            logger.info(`User ${userId} joined voice channel in ${guildId}`);
        }
        else if (oldState.channel && !newState.channel) {
            const startTime = voiceSessionStartTimes.get(key);
            if (startTime) {
                const durationMinutes = Math.floor((Date.now() - startTime) / 60000);
                if (durationMinutes >= 1) {
                    await addVoiceXP(userId, guildId, durationMinutes);
                    logger.info(`Added ${durationMinutes} minutes of voice XP to ${userId} in ${guildId}`);
                }
                voiceSessionStartTimes.delete(key);
            }
            if (client.kazagumo) {
                const player = client.kazagumo.players.get(guildId);
                if (player && player.voiceId === oldState.channelId) {
                    const voiceMembers = oldState.channel?.members.filter(m => !m.user.bot).size || 0;
                    if (voiceMembers === 0) {
                        setTimeout(() => {
                            const updatedPlayer = client.kazagumo?.players.get(guildId);
                            if (updatedPlayer && updatedPlayer.voiceId === oldState.channelId) {
                                const currentMembers = oldState.channel?.members.filter(m => !m.user.bot).size || 0;
                                if (currentMembers === 0) {
                                    updatedPlayer.destroy();
                                }
                            }
                        }, client.config.music.leaveOnEmptyCooldownMs);
                    }
                }
            }
            logger.info(`User ${userId} left voice channel in ${guildId}`);
        }
        else if (oldState.channel && newState.channel && oldState.channelId !== newState.channelId) {
            const startTime = voiceSessionStartTimes.get(key);
            if (startTime) {
                const durationMinutes = Math.floor((Date.now() - startTime) / 60000);
                if (durationMinutes >= 1) {
                    await addVoiceXP(userId, guildId, durationMinutes);
                    logger.info(`Added ${durationMinutes} minutes of voice XP to ${userId} in ${guildId}`);
                }
                voiceSessionStartTimes.set(key, Date.now());
            }
            logger.info(`User ${userId} moved voice channels in ${guildId}`);
        }
    },
};
//# sourceMappingURL=voiceStateUpdate.js.map