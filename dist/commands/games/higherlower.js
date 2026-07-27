// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, ComponentType, ButtonStyle, ActionRowBuilder, ButtonBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class HigherLowerCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'higherlower',
            description: 'Play higher or lower',
            category: 'games',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['hilo', 'highlow'],
            examples: ['/higherlower', 'p!higherlower'],
        };
        super(options);
    }
    currentNumber = 0;
    score = 0;
    gameOver = false;
    initializeGame() {
        this.currentNumber = Math.floor(Math.random() * 100) + 1;
        this.score = 0;
        this.gameOver = false;
    }
    async executeSlash(interaction) {
        this.initializeGame();
        const createButtons = () => {
            const row = new ActionRowBuilder()
                .addComponents(new ButtonBuilder().setCustomId('hl_higher').setLabel('Higher').setStyle(ButtonStyle.Success), new ButtonBuilder().setCustomId('hl_lower').setLabel('Lower').setStyle(ButtonStyle.Danger));
            return [row];
        };
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} Higher or Lower`)
            .setColor(COLORS.info)
            .setDescription(`Current number: ${this.currentNumber}\nWill the next number be higher or lower?\nScore: ${this.score}`)
            .setTimestamp();
        await interaction.reply({ embeds: [embed], components: createButtons() });
        const collector = interaction.channel?.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 60000,
        });
        collector?.on('collect', async (i) => {
            const choice = i.customId.split('_')[1];
            const nextNumber = Math.floor(Math.random() * 100) + 1;
            let correct = false;
            if (choice === 'higher' && nextNumber > this.currentNumber)
                correct = true;
            if (choice === 'lower' && nextNumber < this.currentNumber)
                correct = true;
            this.currentNumber = nextNumber;
            if (correct) {
                this.score++;
                const updateEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.games} Higher or Lower`)
                    .setColor(COLORS.success)
                    .setDescription(`Current number: ${this.currentNumber}\nCorrect! Score: ${this.score}`)
                    .setTimestamp();
                await i.update({ embeds: [updateEmbed], components: createButtons() });
            }
            else {
                this.gameOver = true;
                const loseEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.error} Game Over`)
                    .setColor(COLORS.error)
                    .setDescription(`The number was ${this.currentNumber}\nFinal Score: ${this.score}`)
                    .setTimestamp();
                await i.update({ embeds: [loseEmbed], components: [] });
                collector.stop();
            }
        });
        collector?.on('end', async (collected) => {
            if (collected.size === 0) {
                const timeoutEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.error} Time's Up!`)
                    .setColor(COLORS.error)
                    .setDescription(`Final Score: ${this.score}`)
                    .setTimestamp();
                await interaction.editReply({ embeds: [timeoutEmbed], components: [] });
            }
        });
    }
    async executePrefix(message) {
        this.initializeGame();
        const createButtons = () => {
            const row = new ActionRowBuilder()
                .addComponents(new ButtonBuilder().setCustomId('hl_higher').setLabel('Higher').setStyle(ButtonStyle.Success), new ButtonBuilder().setCustomId('hl_lower').setLabel('Lower').setStyle(ButtonStyle.Danger));
            return [row];
        };
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} Higher or Lower`)
            .setColor(COLORS.info)
            .setDescription(`Current number: ${this.currentNumber}\nWill the next number be higher or lower?\nScore: ${this.score}`)
            .setTimestamp();
        await message.reply({ embeds: [embed], components: createButtons() });
        const collector = message.channel.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 60000,
        });
        collector.on('collect', async (i) => {
            const choice = i.customId.split('_')[1];
            const nextNumber = Math.floor(Math.random() * 100) + 1;
            let correct = false;
            if (choice === 'higher' && nextNumber > this.currentNumber)
                correct = true;
            if (choice === 'lower' && nextNumber < this.currentNumber)
                correct = true;
            this.currentNumber = nextNumber;
            if (correct) {
                this.score++;
                const updateEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.games} Higher or Lower`)
                    .setColor(COLORS.success)
                    .setDescription(`Current number: ${this.currentNumber}\nCorrect! Score: ${this.score}`)
                    .setTimestamp();
                await i.update({ embeds: [updateEmbed], components: createButtons() });
            }
            else {
                this.gameOver = true;
                const loseEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.error} Game Over`)
                    .setColor(COLORS.error)
                    .setDescription(`The number was ${this.currentNumber}\nFinal Score: ${this.score}`)
                    .setTimestamp();
                await i.update({ embeds: [loseEmbed], components: [] });
                collector.stop();
            }
        });
        collector.on('end', async (collected) => {
            if (collected.size === 0) {
                const timeoutEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.error} Time's Up!`)
                    .setColor(COLORS.error)
                    .setDescription(`Final Score: ${this.score}`)
                    .setTimestamp();
                await message.edit({ embeds: [timeoutEmbed], components: [] });
            }
        });
    }
}
export default HigherLowerCommand;
