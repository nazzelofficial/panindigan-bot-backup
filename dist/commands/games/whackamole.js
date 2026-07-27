// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, ComponentType, ButtonStyle, ActionRowBuilder, ButtonBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class WhackAMoleCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'whackamole',
            description: 'Play whack-a-mole game',
            category: 'games',
            cooldown: 10,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['whack', 'mole'],
            examples: ['/whackamole', 'p!whackamole'],
        };
        super(options);
    }
    score = 0;
    molesHit = 0;
    maxMoles = 10;
    isProcessing = false;
    createButtons() {
        const row = new ActionRowBuilder();
        const positions = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
        positions.forEach((pos) => {
            row.addComponents(new ButtonBuilder()
                .setCustomId(`mole_${pos}`)
                .setLabel('🕳️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(this.isProcessing));
        });
        return row;
    }
    async executeSlash(interaction) {
        this.score = 0;
        this.molesHit = 0;
        this.isProcessing = false;
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} Whack-a-Mole`)
            .setColor(COLORS.info)
            .setDescription(`Score: ${this.score}/${this.maxMoles}\n\nClick the mole when it appears!`)
            .setTimestamp();
        await interaction.reply({ embeds: [embed], components: [this.createButtons()] });
        const moleInterval = setInterval(() => {
            if (this.molesHit >= this.maxMoles) {
                clearInterval(moleInterval);
                return;
            }
            this.isProcessing = false;
            const randomPos = Math.floor(Math.random() * 9) + 1;
            const updateButtons = () => {
                const row = new ActionRowBuilder();
                const positions = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
                positions.forEach((pos) => {
                    row.addComponents(new ButtonBuilder()
                        .setCustomId(`mole_${pos}`)
                        .setLabel(pos === randomPos.toString() ? '🐹' : '🕳️')
                        .setStyle(pos === randomPos.toString() ? ButtonStyle.Primary : ButtonStyle.Secondary)
                        .setDisabled(pos !== randomPos.toString()));
                });
                return [row];
            };
            interaction.editReply({ embeds: [embed.setDescription(`Score: ${this.score}/${this.maxMoles}\n\nClick the mole!`)], components: updateButtons() });
            this.isProcessing = true;
            setTimeout(() => {
                if (this.molesHit < this.maxMoles) {
                    this.isProcessing = false;
                    interaction.editReply({ embeds: [embed.setDescription(`Score: ${this.score}/${this.maxMoles}\n\nMissed!`)], components: [this.createButtons()] });
                }
            }, 1500);
        }, 2000);
        const collector = interaction.channel?.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 60000,
        });
        collector?.on('collect', async (i) => {
            if (this.molesHit >= this.maxMoles)
                return;
            this.score++;
            this.molesHit++;
            this.isProcessing = false;
            const updateEmbed = new EmbedBuilder()
                .setTitle(`${EMOJIS.games} Whack-a-Mole`)
                .setColor(COLORS.success)
                .setDescription(`Score: ${this.score}/${this.maxMoles}\n\nHit!`)
                .setTimestamp();
            await i.update({ embeds: [updateEmbed], components: [this.createButtons()] });
            if (this.molesHit >= this.maxMoles) {
                clearInterval(moleInterval);
                const finalEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.games} Game Over`)
                    .setColor(COLORS.info)
                    .setDescription(`Final Score: ${this.score}/${this.maxMoles}`)
                    .setTimestamp();
                await interaction.editReply({ embeds: [finalEmbed], components: [] });
                collector.stop();
            }
        });
        collector?.on('end', async (collected) => {
            clearInterval(moleInterval);
            if (collected.size === 0) {
                const timeoutEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.error} Game Ended`)
                    .setColor(COLORS.error)
                    .setDescription(`Final Score: ${this.score}/${this.maxMoles}`)
                    .setTimestamp();
                await interaction.editReply({ embeds: [timeoutEmbed], components: [] });
            }
        });
    }
    async executePrefix(message) {
        this.score = 0;
        this.molesHit = 0;
        this.isProcessing = false;
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} Whack-a-Mole`)
            .setColor(COLORS.info)
            .setDescription(`Score: ${this.score}/${this.maxMoles}\n\nClick the mole when it appears!`)
            .setTimestamp();
        await message.reply({ embeds: [embed], components: [this.createButtons()] });
        const moleInterval = setInterval(() => {
            if (this.molesHit >= this.maxMoles) {
                clearInterval(moleInterval);
                return;
            }
            this.isProcessing = false;
            const randomPos = Math.floor(Math.random() * 9) + 1;
            const updateButtons = () => {
                const row = new ActionRowBuilder();
                const positions = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
                positions.forEach((pos) => {
                    row.addComponents(new ButtonBuilder()
                        .setCustomId(`mole_${pos}`)
                        .setLabel(pos === randomPos.toString() ? '🐹' : '🕳️')
                        .setStyle(pos === randomPos.toString() ? ButtonStyle.Primary : ButtonStyle.Secondary)
                        .setDisabled(pos !== randomPos.toString()));
                });
                return [row];
            };
            message.edit({ embeds: [embed.setDescription(`Score: ${this.score}/${this.maxMoles}\n\nClick the mole!`)], components: updateButtons() });
            this.isProcessing = true;
            setTimeout(() => {
                if (this.molesHit < this.maxMoles) {
                    this.isProcessing = false;
                    message.edit({ embeds: [embed.setDescription(`Score: ${this.score}/${this.maxMoles}\n\nMissed!`)], components: [this.createButtons()] });
                }
            }, 1500);
        }, 2000);
        const collector = message.channel.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 60000,
        });
        collector.on('collect', async (i) => {
            if (this.molesHit >= this.maxMoles)
                return;
            this.score++;
            this.molesHit++;
            this.isProcessing = false;
            const updateEmbed = new EmbedBuilder()
                .setTitle(`${EMOJIS.games} Whack-a-Mole`)
                .setColor(COLORS.success)
                .setDescription(`Score: ${this.score}/${this.maxMoles}\n\nHit!`)
                .setTimestamp();
            await i.update({ embeds: [updateEmbed], components: [this.createButtons()] });
            if (this.molesHit >= this.maxMoles) {
                clearInterval(moleInterval);
                const finalEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.games} Game Over`)
                    .setColor(COLORS.info)
                    .setDescription(`Final Score: ${this.score}/${this.maxMoles}`)
                    .setTimestamp();
                await message.edit({ embeds: [finalEmbed], components: [] });
                collector.stop();
            }
        });
        collector.on('end', async (collected) => {
            clearInterval(moleInterval);
            if (collected.size === 0) {
                const timeoutEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.error} Game Ended`)
                    .setColor(COLORS.error)
                    .setDescription(`Final Score: ${this.score}/${this.maxMoles}`)
                    .setTimestamp();
                await message.edit({ embeds: [timeoutEmbed], components: [] });
            }
        });
    }
}
export default WhackAMoleCommand;
