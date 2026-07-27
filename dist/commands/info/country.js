// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class CountryCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'country',
            description: 'Get information about a country (via RestCountries API)',
            category: 'info',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: [],
            examples: ['/country Philippines', '/country Japan', 'p!country USA'],
        };
        super(options);
    }
    buildSlashCommand() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(o => o.setName('country').setDescription('Country name').setRequired(true));
    }
    async fetchCountry(name) {
        const url = `https://restcountries.com/v3.1/name/${encodeURIComponent(name)}?fullText=false&fields=name,capital,population,area,region,subregion,languages,currencies,flags,cca2,timezones,borders`;
        const res = await fetch(url);
        if (res.status === 404)
            throw new Error(`Country "${name}" not found.`);
        if (!res.ok)
            throw new Error(`Country API error: ${res.status}`);
        const data = await res.json();
        const c = data[0];
        const languages = Object.values(c.languages || {}).join(', ') || 'N/A';
        const currencies = Object.values(c.currencies || {}).map((cur) => `${cur.name} (${cur.symbol})`).join(', ') || 'N/A';
        const capital = c.capital?.[0] || 'N/A';
        const population = c.population?.toLocaleString() || 'N/A';
        const area = c.area?.toLocaleString() || 'N/A';
        return new EmbedBuilder()
            .setTitle(`${c.flags?.emoji || '🌍'} ${c.name?.common} (${c.cca2})`)
            .setColor(COLORS.info)
            .setThumbnail(c.flags?.png || null)
            .addFields({ name: '🏛️ Capital', value: capital, inline: true }, { name: '🌎 Region', value: `${c.region} > ${c.subregion || 'N/A'}`, inline: true }, { name: '👥 Population', value: population, inline: true }, { name: '📐 Area', value: `${area} km²`, inline: true }, { name: '🗣️ Languages', value: languages.slice(0, 256), inline: true }, { name: '💰 Currency', value: currencies.slice(0, 256), inline: true }, { name: '🕐 Timezones', value: c.timezones?.slice(0, 3).join(', ') || 'N/A', inline: false }, ...(c.borders?.length ? [{ name: '🗺️ Borders', value: c.borders.slice(0, 10).join(', '), inline: false }] : []))
            .setFooter({ text: 'Data from RestCountries API' })
            .setTimestamp();
    }
    async executeSlash(interaction) {
        const country = interaction.options.getString('country', true);
        await interaction.deferReply();
        try {
            const embed = await this.fetchCountry(country);
            await interaction.editReply({ embeds: [embed] });
        }
        catch (err) {
            await interaction.editReply({ content: `${EMOJIS.error} ${err.message || 'Failed to fetch country data.'}` });
        }
    }
    async executePrefix(message, _args) {
        const country = _args.join(' ');
        if (!country)
            return void message.reply(`${EMOJIS.error} Please provide a country name.`);
        const thinking = await message.reply(`${EMOJIS.info} Fetching country data...`);
        try {
            const embed = await this.fetchCountry(country);
            await thinking.edit({ content: null, embeds: [embed] });
        }
        catch (err) {
            await thinking.edit(`${EMOJIS.error} ${err.message || 'Failed to fetch country data.'}`);
        }
    }
}
export default CountryCommand;
