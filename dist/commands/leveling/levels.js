// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
function xpRequired(level) {
    return Math.floor(5 * Math.pow(level, 2) + 50 * level + 100);
}
export class LevelsCommand extends BaseCommand {
    constructor() {
        super({
            name: 'levels',
            description: 'Shows all level thresholds and XP required for each',
            category: 'leveling',
            premiumTier: 'free',
            cooldown: 10,
            ownerOnly: false,
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: [],
            examples: ['p!levels', '/levels'],
        });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addIntegerOption(o => o.setName('page').setDescription('Page (1-3, each shows 10 levels)').setRequired(false).setMinValue(1).setMaxValue(3))
            .setDMPermission(false));
    }
    buildEmbed(page) {
        const start = (page - 1) * 10 + 1;
        const end = Math.min(start + 9, 30);
        const lines = [];
        let cumulative = 0;
        for (let lvl = 1; lvl <= end; lvl++) {
            const needed = xpRequired(lvl);
            cumulative += needed;
            if (lvl >= start) {
                lines.push(`**Level ${lvl}** — ${needed} XP to reach (${cumulative.toLocaleString()} total XP)`);
            }
        }
        return new EmbedBuilder()
            .setTitle(`${EMOJIS.leveling} Level Thresholds (Levels ${start}–${end})`)
            .setColor(COLORS.default)
            .setDescription(lines.join('\n'))
            .setFooter({ text: `Formula: 5×level² + 50×level + 100 XP per level • Page ${page}/3` })
            .setTimestamp();
    }
    async executeSlash(i) {
        try {
            const page = i.options.getInteger('page') || 1;
            await i.reply({ embeds: [this.buildEmbed(page)] });
        }
        catch {
            await i.reply({ content: `${EMOJIS.error} Failed to display levels.`, ephemeral: true });
        }
    }
    async executePrefix(m, _args) {
        try {
            const page = Math.min(3, Math.max(1, parseInt(args[0]) || 1));
            await m.reply({ embeds: [this.buildEmbed(page)] });
        }
        catch {
            await m.reply(`${EMOJIS.error} Failed to display levels.`);
        }
    }
}
export default LevelsCommand;
