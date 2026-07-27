// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class WheelOfFortuneCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'wheeloffortune',
            description: 'Spin the wheel of fortune (simplified)',
            category: 'games',
            cooldown: 10,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['wheel', 'wof'],
            examples: ['/wheeloffortune', 'p!wheeloffortune'],
        };
        super(options);
    }
    prizes = [
        { name: '💰 1000 coins', weight: 10 },
        { name: '💎 500 coins', weight: 15 },
        { name: '🎁 250 coins', weight: 20 },
        { name: '🍀 100 coins', weight: 25 },
        { name: '😢 Nothing', weight: 30 },
    ];
    async executeSlash(interaction) {
        const totalWeight = this.prizes.reduce((sum, prize) => sum + prize.weight, 0);
        let random = Math.random() * totalWeight;
        let result = this.prizes[this.prizes.length - 1];
        for (const prize of this.prizes) {
            if (random < prize.weight) {
                result = prize;
                break;
            }
            random -= prize.weight;
        }
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} Wheel of Fortune`)
            .setColor(COLORS.info)
            .setDescription(`🎡 You spun the wheel and got:\n\n**${result.name}**`)
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message) {
        const totalWeight = this.prizes.reduce((sum, prize) => sum + prize.weight, 0);
        let random = Math.random() * totalWeight;
        let result = this.prizes[this.prizes.length - 1];
        for (const prize of this.prizes) {
            if (random < prize.weight) {
                result = prize;
                break;
            }
            random -= prize.weight;
        }
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} Wheel of Fortune`)
            .setColor(COLORS.info)
            .setDescription(`🎡 You spun the wheel and got:\n\n**${result.name}**`)
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default WheelOfFortuneCommand;
