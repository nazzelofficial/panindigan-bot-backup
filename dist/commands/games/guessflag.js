// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, ComponentType, ButtonStyle, ActionRowBuilder, ButtonBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class GuessFlagCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'guessflag',
            description: 'Guess the country from the flag',
            category: 'games',
            cooldown: 10,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['flagquiz', 'countryflag'],
            examples: ['/guessflag', 'p!guessflag'],
        };
        super(options);
    }
    flags = [
        { country: 'Japan', emoji: '🇯🇵' },
        { country: 'United States', emoji: '🇺🇸' },
        { country: 'United Kingdom', emoji: '🇬🇧' },
        { country: 'France', emoji: '🇫🇷' },
        { country: 'Germany', emoji: '🇩🇪' },
        { country: 'Canada', emoji: '🇨🇦' },
        { country: 'Australia', emoji: '🇦🇺' },
        { country: 'Brazil', emoji: '🇧🇷' },
        { country: 'Italy', emoji: '🇮🇹' },
        { country: 'Spain', emoji: '🇪🇸' },
    ];
    async executeSlash(interaction) {
        const flag = this.flags[Math.floor(Math.random() * this.flags.length)];
        const wrongOptions = this.flags
            .filter((f) => f.country !== flag.country)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);
        const options = [flag, ...wrongOptions].sort(() => Math.random() - 0.5);
        const row = new ActionRowBuilder()
            .addComponents(options.map((option) => new ButtonBuilder()
            .setCustomId(`flag_${option.country}`)
            .setLabel(option.country)
            .setStyle(ButtonStyle.Primary)));
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} Guess the Flag`)
            .setColor(COLORS.info)
            .setDescription(`Which country does this flag belong to?\n\n${flag.emoji}`)
            .setTimestamp();
        await interaction.reply({ embeds: [embed], components: [row] });
        const collector = interaction.channel?.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 30000,
        });
        collector?.on('collect', async (i) => {
            const selectedCountry = i.customId.split('_')[1];
            if (selectedCountry === flag.country) {
                const winEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.games} Correct!`)
                    .setColor(COLORS.success)
                    .setDescription(`The flag belongs to ${flag.country}! ${flag.emoji}`)
                    .setTimestamp();
                await i.update({ embeds: [winEmbed], components: [] });
                collector.stop();
            }
            else {
                const loseEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.error} Wrong!`)
                    .setColor(COLORS.error)
                    .setDescription(`The flag belongs to ${flag.country}! ${flag.emoji}`)
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
                    .setDescription(`The flag belongs to ${flag.country}! ${flag.emoji}`)
                    .setTimestamp();
                await interaction.editReply({ embeds: [timeoutEmbed], components: [] });
            }
        });
    }
    async executePrefix(message) {
        const flag = this.flags[Math.floor(Math.random() * this.flags.length)];
        const wrongOptions = this.flags
            .filter((f) => f.country !== flag.country)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);
        const options = [flag, ...wrongOptions].sort(() => Math.random() - 0.5);
        const row = new ActionRowBuilder()
            .addComponents(options.map((option) => new ButtonBuilder()
            .setCustomId(`flag_${option.country}`)
            .setLabel(option.country)
            .setStyle(ButtonStyle.Primary)));
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.games} Guess the Flag`)
            .setColor(COLORS.info)
            .setDescription(`Which country does this flag belong to?\n\n${flag.emoji}`)
            .setTimestamp();
        await message.reply({ embeds: [embed], components: [row] });
        const collector = message.channel.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 30000,
        });
        collector.on('collect', async (i) => {
            const selectedCountry = i.customId.split('_')[1];
            if (selectedCountry === flag.country) {
                const winEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.games} Correct!`)
                    .setColor(COLORS.success)
                    .setDescription(`The flag belongs to ${flag.country}! ${flag.emoji}`)
                    .setTimestamp();
                await i.update({ embeds: [winEmbed], components: [] });
                collector.stop();
            }
            else {
                const loseEmbed = new EmbedBuilder()
                    .setTitle(`${EMOJIS.error} Wrong!`)
                    .setColor(COLORS.error)
                    .setDescription(`The flag belongs to ${flag.country}! ${flag.emoji}`)
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
                    .setDescription(`The flag belongs to ${flag.country}! ${flag.emoji}`)
                    .setTimestamp();
                await message.edit({ embeds: [timeoutEmbed], components: [] });
            }
        });
    }
}
export default GuessFlagCommand;
