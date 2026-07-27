// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class GuildUnblacklistCommand extends BaseCommand {
    constructor() {
        super({
            name: 'guildunblacklist',
            description: 'Remove a guild from the blacklist',
            category: 'owner',
            premiumTier: 'free',
            cooldown: 0,
            ownerOnly: true,
            guildOnly: false,
            slashCommand: false,
            prefixCommand: true,
            aliases: ['gunbl', 'unblacklistguild'],
            examples: ['p!guildunblacklist 123456789'],
        });
    }
    buildSlashCommand() {
        return new SlashCommandBuilder().setName(this.name).setDescription(this.description).setDMPermission(false);
    }
    async executeSlash(i) {
        await i.reply({ content: 'Use prefix command `p!guildunblacklist <guildId>` for this.', ephemeral: true });
    }
    async executePrefix(m, _args) {
        try {
            const guildId = args[0];
            if (!guildId) {
                await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Provide a guild ID.')] });
                return;
            }
            const prisma = getPrismaClient();
            const existing = await prisma.guild.findUnique({ where: { id: guildId } });
            if (!existing || !existing.isBlacklisted) {
                await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ Guild \`${guildId}\` is not blacklisted.`)] });
                return;
            }
            await prisma.guild.update({
                where: { id: guildId },
                data: { isBlacklisted: false, blacklistReason: null },
            });
            const guild = m.client.guilds.cache.get(guildId);
            const guildName = guild?.name ?? guildId;
            const embed = new EmbedBuilder()
                .setTitle('✅ Guild Unblacklisted')
                .setColor(COLORS.success)
                .setDescription(`Guild **${guildName}** (\`${guildId}\`) has been removed from the blacklist.`)
                .setTimestamp();
            await m.reply({ embeds: [embed] });
        }
        catch (err) {
            await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ Error: ${err?.message}`)] });
        }
    }
}
export default GuildUnblacklistCommand;
