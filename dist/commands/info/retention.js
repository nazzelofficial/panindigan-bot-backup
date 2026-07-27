// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class RetentionCommand extends BaseCommand {
    constructor() {
        super({
            name: 'retention',
            description: 'View member retention analytics for this server (Gold+)',
            category: 'info',
            premiumTier: 'gold',
            cooldown: 30,
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['memberretention', 'retentionstats'],
            examples: ['/retention', 'p!retention'],
        });
    }
    async buildEmbed(guild) {
        await guild.members.fetch();
        const members = guild.members.cache;
        const now = Date.now();
        const DAY = 86400000;
        const ranges = [
            { label: '< 1 day', filter: (m) => now - m.joinedAt.getTime() < DAY },
            { label: '1–7 days', filter: (m) => { const d = now - m.joinedAt.getTime(); return d >= DAY && d < 7 * DAY; } },
            { label: '1–4 weeks', filter: (m) => { const d = now - m.joinedAt.getTime(); return d >= 7 * DAY && d < 30 * DAY; } },
            { label: '1–6 months', filter: (m) => { const d = now - m.joinedAt.getTime(); return d >= 30 * DAY && d < 180 * DAY; } },
            { label: '6–12 months', filter: (m) => { const d = now - m.joinedAt.getTime(); return d >= 180 * DAY && d < 365 * DAY; } },
            { label: '> 1 year', filter: (m) => now - m.joinedAt.getTime() >= 365 * DAY },
        ];
        const total = members.size;
        const counts = ranges.map(r => ({ label: r.label, count: members.filter(r.filter).size }));
        const bar = (count) => {
            const pct = total > 0 ? count / total : 0;
            const filled = Math.round(pct * 10);
            return `${'█'.repeat(filled)}${'░'.repeat(10 - filled)} ${(pct * 100).toFixed(1)}%`;
        };
        return new EmbedBuilder()
            .setTitle(`📊 Member Retention — ${guild.name}`)
            .setColor(COLORS.gold)
            .setDescription(`Total members: **${total}**`)
            .addFields(counts.map(c => ({
            name: `🕐 ${c.label}`,
            value: `${c.count} members\n\`${bar(c.count)}\``,
            inline: false,
        })))
            .setFooter({ text: 'Gold tier analytics • Data based on join dates' })
            .setTimestamp();
    }
    async executeSlash(interaction) {
        await interaction.deferReply();
        const embed = await this.buildEmbed(interaction.guild);
        await interaction.editReply({ embeds: [embed] });
    }
    async executePrefix(message) {
        if (!message.guild)
            return;
        const msg = await message.reply(`${EMOJIS.loading} Calculating retention stats...`);
        const embed = await this.buildEmbed(message.guild);
        await msg.edit({ content: null, embeds: [embed] });
    }
}
export default RetentionCommand;
