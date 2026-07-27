// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
export class TarotCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'tarot',
            description: 'Get a 3-card tarot reading',
            category: 'fun',
            premiumTier: 'bronze',
            cooldown: 10,
            userPermissions: [],
            botPermissions: [],
            ownerOnly: false,
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['cards', 'tarotreading'],
            examples: ['/tarot', 'p!tarot'],
        };
        super(options);
    }
    majorArcana = [
        { name: 'The Fool', number: '0', emoji: '🃏', meaning: 'New beginnings, innocence, spontaneity, a free spirit' },
        { name: 'The Magician', number: 'I', emoji: '🎩', meaning: 'Power, skill, concentration, action, resourcefulness' },
        { name: 'The High Priestess', number: 'II', emoji: '🌙', meaning: 'Intuition, sacred knowledge, divine feminine, the subconscious' },
        { name: 'The Empress', number: 'III', emoji: '👑', meaning: 'Femininity, beauty, nature, nurturing, abundance' },
        { name: 'The Emperor', number: 'IV', emoji: '⚔️', meaning: 'Authority, structure, control, fatherhood, stability' },
        { name: 'The Hierophant', number: 'V', emoji: '🏛️', meaning: 'Spiritual wisdom, tradition, conformity, institutions' },
        { name: 'The Lovers', number: 'VI', emoji: '💕', meaning: 'Love, harmony, relationships, choices, alignment' },
        { name: 'The Chariot', number: 'VII', emoji: '🏇', meaning: 'Control, willpower, success, determination, ambition' },
        { name: 'Strength', number: 'VIII', emoji: '🦁', meaning: 'Strength, courage, persuasion, influence, compassion' },
        { name: 'The Hermit', number: 'IX', emoji: '🕯️', meaning: 'Soul-searching, introspection, solitude, inner guidance' },
        { name: 'Wheel of Fortune', number: 'X', emoji: '🎡', meaning: 'Good luck, karma, life cycles, destiny, turning points' },
        { name: 'Justice', number: 'XI', emoji: '⚖️', meaning: 'Justice, fairness, truth, cause and effect, law' },
        { name: 'The Hanged Man', number: 'XII', emoji: '🔄', meaning: 'Suspension, restriction, letting go, sacrifice, new perspectives' },
        { name: 'Death', number: 'XIII', emoji: '💀', meaning: 'Endings, change, transformation, transition, new beginnings' },
        { name: 'Temperance', number: 'XIV', emoji: '🌊', meaning: 'Balance, moderation, patience, purpose, meaning' },
        { name: 'The Devil', number: 'XV', emoji: '😈', meaning: 'Shadow self, attachment, addiction, restriction, sexuality' },
        { name: 'The Tower', number: 'XVI', emoji: '⚡', meaning: 'Sudden change, upheaval, chaos, revelation, awakening' },
        { name: 'The Star', number: 'XVII', emoji: '⭐', meaning: 'Hope, faith, purpose, renewal, spirituality' },
        { name: 'The Moon', number: 'XVIII', emoji: '🌕', meaning: 'Illusion, fear, the unconscious, confusion, complex emotions' },
        { name: 'The Sun', number: 'XIX', emoji: '☀️', meaning: 'Positivity, fun, warmth, success, vitality' },
        { name: 'Judgement', number: 'XX', emoji: '📯', meaning: 'Judgement, rebirth, inner calling, absolution' },
        { name: 'The World', number: 'XXI', emoji: '🌍', meaning: 'Completion, integration, accomplishment, travel' },
    ];
    positions = ['Past', 'Present', 'Future'];
    shuffleAndPick(count) {
        const shuffled = [...this.majorArcana].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }
    buildEmbed() {
        const cards = this.shuffleAndPick(3);
        const embed = new EmbedBuilder()
            .setTitle('🔮 Three-Card Tarot Reading')
            .setDescription('The cards have been drawn. Here is your reading:')
            .setColor(0x6a0dad)
            .setTimestamp()
            .setFooter({ text: 'For entertainment purposes only ✨' });
        cards.forEach((card, i) => {
            const reversed = Math.random() > 0.7;
            embed.addFields({
                name: `${card.emoji} ${this.positions[i]}: ${card.name} ${card.number}${reversed ? ' (Reversed)' : ''}`,
                value: card.meaning,
                inline: false,
            });
        });
        return embed;
    }
    async executeSlash(interaction) {
        const embed = this.buildEmbed();
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message) {
        const embed = this.buildEmbed();
        await message.reply({ embeds: [embed] });
    }
}
export default TarotCommand;
