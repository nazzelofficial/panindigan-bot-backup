// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class GuildBlacklistCommand extends BaseCommand {
    constructor() {
        super({
            name: 'guildblacklist',
            description: 'Blacklist a guild from using the bot',
            category: 'owner',
            premiumTier: 'free',
            cooldown: 0,
            ownerOnly: true,
            guildOnly: false,
            slashCommand: false,
            prefixCommand: true,
            aliases: ['gbl', 'blacklistguild'],
            examples: ['p!guildblacklist 123456789 Spam abuse'],
        });
    }
    buildSlashCommand() {
        return new SlashCommandBuilder().setName(this.name).setDescription(this.description).setDMPermission(false);
    }
    async executeSlash(i) {
        await i.reply({ content: 'Use prefix command `p!guildblacklist <guildId> <reason>` for this.', ephemeral: true });
    }
    async executePrefix(m, _args) {
        try {
            const guildId = args[0];
            const reason = _args.slice(1).join(' ') || 'No reason provided';
            if (!guildId) {
                await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Usage: `p!guildblacklist <guildId> <reason>`')] });
                return;
            }
            const prisma = getPrismaClient();
            await prisma.guild.upsert({
                where: { id: guildId },
                create: { id: guildId, isBlacklisted: true, blacklistReason: reason },
                update: { isBlacklisted: true, blacklistReason: reason },
            });
            const guild = m.client.guilds.cache.get(guildId);
            const guildName = guild?.name ?? guildId;
            const embed = new EmbedBuilder()
                .setTitle('🚫 Guild Blacklisted')
                .setColor(COLORS.error)
                .addFields({ name: 'Guild', value: `${guildName} (\`${guildId}\`)`, inline: true }, { name: 'Reason', value: reason, inline: false }, { name: 'Blacklisted By', value: `${m.author.tag}`, inline: true })
                .setTimestamp();
            await m.reply({ embeds: [embed] });
        }
        catch (err) {
            await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ Error: ${err?.message}`)] });
        }
    }
}
export default GuildBlacklistCommand;
