import { getPrismaClient } from '../database/postgresql/client.js';
import { logger } from '../utils/Logger.js';
export const event = {
    name: 'guildDelete',
    once: false,
    async execute(guild, client) {
        logger.info(`Left guild: ${guild.name} (${guild.id})`);
        try {
            const prisma = getPrismaClient();
            await prisma.guild.delete({
                where: { guildId: guild.id },
            });
            logger.info(`Deleted guild record for ${guild.id}`);
        }
        catch (error) {
            logger.error(`Failed to delete guild record for ${guild.id}:`, error);
        }
    },
};
