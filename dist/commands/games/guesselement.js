// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class GuessElementCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'guesselement',
            description: 'Guess the chemical element from a description',
            category: 'games',
            cooldown: 10,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['elementquiz', 'chemistry'],
            examples: ['/guesselement', 'p!guesselement'],
        };
        super(options);
    }
    elements = [
        { description: 'I am the most abundant gas in Earth\'s atmosphere', element: 'Nitrogen' },
        { description: 'I am essential for breathing and have symbol O', element: 'Oxygen' },
        { description: 'I am the lightest element and have symbol H', element: 'Hydrogen' },
        { description: 'I am a noble gas used in balloons', element: 'Helium' },
        { description: 'I have symbol Au and are very valuable', element: 'Gold' },
    ];
    async executeSlash(interaction) {
        const element = this.elements[Math.floor(Math.random() * this.elements.length)];
        let attempts = 0;
        const maxAttempts = 3;
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} Guess the Element`)
            .setColor(COLORS.info)
            .setDescription(`Guess the chemical element from this description:\n\n"${element.description}"\n\nYou have ${maxAttempts} attempts.`)
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
        const collector = interaction.channel?.createMessageCollector({
            filter: (m) => m.author.id === interaction.user.id,
            time: 60000,
        });
        collector?.on('collect', async (m) => {
            attempts++;
            if (m.content.toLowerCase() === element.element.toLowerCase()) {
                const winEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.games} You Won!`)
                    .setColor(COLORS.success)
                    .setDescription(`The element was ${element.element}. You got it in ${attempts} attempts!`)
                    .setTimestamp();
                await interaction.editReply({ embeds: [winEmbed] });
                collector.stop();
            }
            else if (attempts >= maxAttempts) {
                const loseEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.error} Game Over`)
                    .setColor(COLORS.error)
                    .setDescription(`The element was ${element.element}.`)
                    .setTimestamp();
                await interaction.editReply({ embeds: [loseEmbed] });
                collector.stop();
            }
            else {
                const updateEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.games} Guess the Element`)
                    .setColor(COLORS.info)
                    .setDescription(`Wrong! Attempts left: ${maxAttempts - attempts}\n\n"${element.description}"`)
                    .setTimestamp();
                await interaction.editReply({ embeds: [updateEmbed] });
            }
        });
        collector?.on('end', async (collected) => {
            if (collected.size === 0) {
                const timeoutEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.error} Time's Up!`)
                    .setColor(COLORS.error)
                    .setDescription(`The element was ${element.element}.`)
                    .setTimestamp();
                await interaction.editReply({ embeds: [timeoutEmbed] });
            }
        });
    }
    async executePrefix(message) {
        const element = this.elements[Math.floor(Math.random() * this.elements.length)];
        let attempts = 0;
        const maxAttempts = 3;
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} Guess the Element`)
            .setColor(COLORS.info)
            .setDescription(`Guess the chemical element from this description:\n\n"${element.description}"\n\nYou have ${maxAttempts} attempts.`)
            .setTimestamp();
        await message.reply({ embeds: [embed] });
        const collector = message.channel.createMessageCollector({
            filter: (m) => m.author.id === message.author.id,
            time: 60000,
        });
        collector.on('collect', async (m) => {
            attempts++;
            if (m.content.toLowerCase() === element.element.toLowerCase()) {
                const winEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.games} You Won!`)
                    .setColor(COLORS.success)
                    .setDescription(`The element was ${element.element}. You got it in ${attempts} attempts!`)
                    .setTimestamp();
                await message.edit({ embeds: [winEmbed] });
                collector.stop();
            }
            else if (attempts >= maxAttempts) {
                const loseEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.error} Game Over`)
                    .setColor(COLORS.error)
                    .setDescription(`The element was ${element.element}.`)
                    .setTimestamp();
                await message.edit({ embeds: [loseEmbed] });
                collector.stop();
            }
            else {
                const updateEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.games} Guess the Element`)
                    .setColor(COLORS.info)
                    .setDescription(`Wrong! Attempts left: ${maxAttempts - attempts}\n\n"${element.description}"`)
                    .setTimestamp();
                await message.edit({ embeds: [updateEmbed] });
            }
        });
        collector.on('end', async (collected) => {
            if (collected.size === 0) {
                const timeoutEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.error} Time's Up!`)
                    .setColor(COLORS.error)
                    .setDescription(`The element was ${element.element}.`)
                    .setTimestamp();
                await message.edit({ embeds: [timeoutEmbed] });
            }
        });
    }
}
export default GuessElementCommand;
