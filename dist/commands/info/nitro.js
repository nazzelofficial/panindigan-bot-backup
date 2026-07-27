// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class NitroCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'nitro',
            description: 'Display information about Discord Nitro',
            category: 'info',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: [],
            examples: ['/nitro', 'p!nitro'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.info} Discord Nitro Information`)
            .setColor(COLORS.info)
            .setDescription('Information about Discord Nitro subscriptions and benefits.')
            .addFields([
            { name: 'Nitro Classic', value: 'Basic perks including custom emojis, animated avatars, and more.', inline: false },
            { name: 'Nitro', value: 'All Classic perks plus server boosts, 2 server boosts, and more.', inline: false },
            { name: 'Nitro Basic', value: 'Basic perks without server boosts at a lower price.', inline: false },
            { name: 'Server Boosts', value: 'Boost your server to unlock perks like better audio quality, more emoji slots, and more.', inline: false },
        ])
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message) {
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.info} Discord Nitro Information`)
            .setColor(COLORS.info)
            .setDescription('Information about Discord Nitro subscriptions and benefits.')
            .addFields([
            { name: 'Nitro Classic', value: 'Basic perks including custom emojis, animated avatars, and more.', inline: false },
            { name: 'Nitro', value: 'All Classic perks plus server boosts, 2 server boosts, and more.', inline: false },
            { name: 'Nitro Basic', value: 'Basic perks without server boosts at a lower price.', inline: false },
            { name: 'Server Boosts', value: 'Boost your server to unlock perks like better audio quality, more emoji slots, and more.', inline: false },
        ])
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default NitroCommand;
