// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
const PAGE_SIZE = 10;
export class GuildListCommand extends BaseCommand {
    constructor() {
        super({
            name: 'guildlist',
            description: 'Lists all guilds the bot is in (paginated)',
            category: 'owner',
            premiumTier: 'free',
            cooldown: 0,
            ownerOnly: true,
            guildOnly: false,
            slashCommand: false,
            prefixCommand: true,
            aliases: ['guilds', 'serverlist'],
            examples: ['p!guildlist', 'p!guildlist 2'],
        });
    }
    buildSlashCommand() {
        return new SlashCommandBuilder().setName(this.name).setDescription(this.description).setDMPermission(false);
    }
    async executeSlash(i) {
        await i.reply({ content: 'Use prefix command `p!guildlist [page]` for this.', ephemeral: true });
    }
    async executePrefix(m, _args) {
        try {
            const guilds = [...m.client.guilds.cache.values()].sort((a, b) => b.memberCount - a.memberCount);
            const page = Math.max(1, parseInt(args[0]) || 1);
            const totalPages = Math.ceil(guilds.length / PAGE_SIZE);
            const start = (page - 1) * PAGE_SIZE;
            const slice = guilds.slice(start, start + PAGE_SIZE);
            if (slice.length === 0) {
                await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription('❌ No guilds found on that page.')] });
                return;
            }
            const rows = slice.map((g, idx) => `\`${start + idx + 1}.\` **${g.name}** — ID: \`${g.id}\` — Members: **${g.memberCount}**`).join('\n');
            const embed = new EmbedBuilder()
                .setTitle(`🌐 Guild List (${guilds.length} total)`)
                .setColor(COLORS.default)
                .setDescription(rows)
                .setFooter({ text: `Page ${page} of ${totalPages}` })
                .setTimestamp();
            await m.reply({ embeds: [embed] });
        }
        catch (err) {
            await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ Error: ${err?.message}`)] });
        }
    }
}
export default GuildListCommand;
