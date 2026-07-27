// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class SimonSaysCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'simonsays',
            description: 'Play Simon Says memory game',
            category: 'games',
            cooldown: 10,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['simon'],
            examples: ['/simonsays', 'p!simonsays'],
        };
        super(options);
    }
    sequence = [];
    currentIndex = 0;
    emojis = ['🔴', '🔵', '🟢', '🟡'];
    addToSequence() {
        this.sequence.push(this.emojis[Math.floor(Math.random() * this.emojis.length)]);
    }
    async executeSlash(interaction) {
        this.sequence = [];
        this.currentIndex = 0;
        this.addToSequence();
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} Simon Says`)
            .setColor(COLORS.info)
            .setDescription(`Watch the sequence and repeat it!\n\nSequence: ${this.sequence.join(' ')}`)
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
        const collector = interaction.channel?.createMessageCollector({
            filter: (m) => m.author.id === interaction.user.id,
            time: 120000,
        });
        collector?.on('collect', async (m) => {
            const userSequence = m.content.split(' ');
            if (userSequence[this.currentIndex] === this.sequence[this.currentIndex]) {
                this.currentIndex++;
                if (this.currentIndex === this.sequence.length) {
                    this.currentIndex = 0;
                    this.addToSequence();
                    const updateEmbed = new EmbedBuilder()
                        .setTitle(`${EMOJIS.games} Simon Says`)
                        .setColor(COLORS.success)
                        .setDescription(`Correct! New sequence:\n\n${this.sequence.join(' ')}`)
                        .setTimestamp();
                    await interaction.editReply({ embeds: [updateEmbed] });
                }
            }
            else {
                const loseEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.error} Wrong!`)
                    .setColor(COLORS.error)
                    .setDescription(`You got sequence length ${this.sequence.length} wrong!`)
                    .setTimestamp();
                await interaction.editReply({ embeds: [loseEmbed] });
                collector.stop();
            }
        });
        collector?.on('end', async (collected) => {
            if (collected.size === 0) {
                const timeoutEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.error} Time's Up!`)
                    .setColor(COLORS.error)
                    .setDescription(`You reached sequence length ${this.sequence.length}.`)
                    .setTimestamp();
                await interaction.editReply({ embeds: [timeoutEmbed] });
            }
        });
    }
    async executePrefix(message) {
        this.sequence = [];
        this.currentIndex = 0;
        this.addToSequence();
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} Simon Says`)
            .setColor(COLORS.info)
            .setDescription(`Watch the sequence and repeat it!\n\nSequence: ${this.sequence.join(' ')}`)
            .setTimestamp();
        await message.reply({ embeds: [embed] });
        const collector = message.channel.createMessageCollector({
            filter: (m) => m.author.id === message.author.id,
            time: 120000,
        });
        collector.on('collect', async (m) => {
            const userSequence = m.content.split(' ');
            if (userSequence[this.currentIndex] === this.sequence[this.currentIndex]) {
                this.currentIndex++;
                if (this.currentIndex === this.sequence.length) {
                    this.currentIndex = 0;
                    this.addToSequence();
                    const updateEmbed = new EmbedBuilder()
                        .setTitle(`${EMOJIS.games} Simon Says`)
                        .setColor(COLORS.success)
                        .setDescription(`Correct! New sequence:\n\n${this.sequence.join(' ')}`)
                        .setTimestamp();
                    await message.edit({ embeds: [updateEmbed] });
                }
            }
            else {
                const loseEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.error} Wrong!`)
                    .setColor(COLORS.error)
                    .setDescription(`You got sequence length ${this.sequence.length} wrong!`)
                    .setTimestamp();
                await message.edit({ embeds: [loseEmbed] });
                collector.stop();
            }
        });
        collector.on('end', async (collected) => {
            if (collected.size === 0) {
                const timeoutEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.error} Time's Up!`)
                    .setColor(COLORS.error)
                    .setDescription(`You reached sequence length ${this.sequence.length}.`)
                    .setTimestamp();
                await message.edit({ embeds: [timeoutEmbed] });
            }
        });
    }
}
export default SimonSaysCommand;
