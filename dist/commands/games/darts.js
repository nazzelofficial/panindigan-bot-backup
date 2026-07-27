// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
const ZONES = [
    { name: 'Bullseye 🎯', min: 96, points: 50 },
    { name: 'Bull ring 🔴', min: 88, points: 25 },
    { name: 'Triple ring 🟡', min: 70, points: 0, triple: true },
    { name: 'Double ring 🟢', min: 55, points: 0, double: true },
    { name: 'Single section', min: 30, points: 0 },
    { name: 'Outer single', min: 10, points: 0 },
    { name: 'Miss! 🌑', min: 0, points: 0, miss: true },
];
const SEGMENT_NUMBERS = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
function throwDart() {
    const accuracy = Math.random() * 100;
    const zone = ZONES.find(z => accuracy >= z.min) || ZONES[ZONES.length - 1];
    const segment = SEGMENT_NUMBERS[Math.floor(Math.random() * SEGMENT_NUMBERS.length)];
    let score = zone.miss ? 0 : zone.points > 0 ? zone.points : segment;
    let desc = zone.name;
    if (zone.triple && !zone.miss) {
        score = segment * 3;
        desc = `Triple ${segment} 🟡`;
    }
    else if (zone.double && !zone.miss) {
        score = segment * 2;
        desc = `Double ${segment} 🟢`;
    }
    else if (!zone.miss && !zone.points) {
        desc = `${segment} points`;
    }
    return { zone, segment, score, desc };
}
export class DartsCommand extends BaseCommand {
    constructor() {
        super({
            name: 'darts',
            description: 'Play a game of darts — throw 3 darts and aim for the highest score!',
            category: 'games',
            premiumTier: 'silver',
            cooldown: 5,
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['dart', 'throwing'],
            examples: ['/darts', 'p!darts'],
        });
    }
    async runDarts(username) {
        const throws = [throwDart(), throwDart(), throwDart()];
        const total = throws.reduce((s, t) => s + t.score, 0);
        const ratings = [
            { min: 141, label: '🏆 PERFECT GAME!', color: COLORS.gold },
            { min: 100, label: '🌟 Excellent!', color: COLORS.success },
            { min: 60, label: '👍 Good throw!', color: COLORS.info },
            { min: 30, label: '😐 Average...', color: COLORS.warning },
            { min: 0, label: '😬 Needs practice', color: COLORS.error },
        ];
        const rating = ratings.find(r => total >= r.min) || ratings[ratings.length - 1];
        return new EmbedBuilder()
            .setTitle(`🎯 Darts — ${username}`)
            .setColor(rating.color)
            .addFields(...throws.map((t, i) => ({ name: `🎯 Dart ${i + 1}`, value: `${t.desc} → **${t.score} pts**`, inline: true })), { name: '📊 Total Score', value: `**${total} / 180 pts**`, inline: false }, { name: '🏅 Rating', value: rating.label, inline: true })
            .setDescription(total >= 141 ? '🏆 You hit the maximum possible score!' : `Score to beat: **180 pts** (current: **${total}**).`)
            .setTimestamp();
    }
    async executeSlash(interaction) {
        const embed = await this.runDarts(interaction.user.username);
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message) {
        const embed = await this.runDarts(message.author.username);
        await message.reply({ embeds: [embed] });
    }
}
export default DartsCommand;
