// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class AfkCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'afk',
            description: 'Set yourself as AFK (Away From Keyboard)',
            category: 'utility',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: [],
            examples: ['/afk', '/afk eating lunch', 'p!afk working'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const reason = interaction.options.getString('reason') || 'AFK';
        const userId = interaction.user.id;
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.info} ⏸️ AFK Set`)
            .setColor(COLORS.info)
            .setDescription(`${interaction.user} is now AFK: **${reason}**`)
            .addFields([
            { name: 'Reason', value: reason, inline: true },
            { name: 'Since', value: new Date().toLocaleString(), inline: true },
        ])
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message) {
        const _args = message.content.split(' ').slice(1);
        const reason = _args.join(' ') || 'AFK';
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.info} ⏸️ AFK Set`)
            .setColor(COLORS.info)
            .setDescription(`${message.author} is now AFK: **${reason}**`)
            .addFields([
            { name: 'Reason', value: reason, inline: true },
            { name: 'Since', value: new Date().toLocaleString(), inline: true },
        ])
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default AfkCommand;
