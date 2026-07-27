// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class DadjokeCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'dadjoke',
            description: 'Get a random dad joke',
            category: 'fun',
            premiumTier: 'bronze',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            ownerOnly: false,
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['dad', 'joke2'],
            examples: ['/dadjoke', 'p!dadjoke'],
        };
        super(options);
    }
    async fetchJoke() {
        try {
            const response = await fetch('https://icanhazdadjoke.com/', {
                headers: { Accept: 'application/json' },
            });
            if (!response.ok)
                return null;
            const data = await response.json();
            return data.joke ?? null;
        }
        catch {
            return null;
        }
    }
    async executeSlash(interaction) {
        await interaction.deferReply();
        const joke = await this.fetchJoke();
        if (!joke) {
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.error} Fetch Failed`)
                .setDescription('Could not fetch a dad joke right now. Please try again later!')
                .setColor(COLORS.error);
            await interaction.editReply({ embeds: [embed] });
            return;
        }
        const embed = new EmbedBuilder()
            .setTitle('👨 Dad Joke')
            .setDescription(`*${joke}*`)
            .setColor(COLORS.warning)
            .setFooter({ text: 'Powered by icanhazdadjoke.com 😄' })
            .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
    }
    async executePrefix(message) {
        const joke = await this.fetchJoke();
        if (!joke) {
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.error} Fetch Failed`)
                .setDescription('Could not fetch a dad joke right now. Please try again later!')
                .setColor(COLORS.error);
            await message.reply({ embeds: [embed] });
            return;
        }
        const embed = new EmbedBuilder()
            .setTitle('👨 Dad Joke')
            .setDescription(`*${joke}*`)
            .setColor(COLORS.warning)
            .setFooter({ text: 'Powered by icanhazdadjoke.com 😄' })
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default DadjokeCommand;
