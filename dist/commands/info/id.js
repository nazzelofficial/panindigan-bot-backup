// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class IdCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'id',
            description: 'Display the ID of a user, channel, or role',
            category: 'info',
            cooldown: 5,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['getid'],
            examples: ['/id @user', '/id #channel', 'p!id @role'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const user = interaction.options.getUser('user');
        const channel = interaction.options.getChannel('channel');
        const role = interaction.options.getRole('role');
        let id = '';
        let name = '';
        if (user) {
            id = user.id;
            name = user.username;
        }
        else if (channel) {
            id = channel.id;
            name = channel.name;
        }
        else if (role) {
            id = role.id;
            name = role.name;
        }
        else {
            id = interaction.user.id;
            name = interaction.user.username;
        }
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.info} ID Information`)
            .setColor(COLORS.info)
            .addFields([
            { name: 'Name', value: name, inline: true },
            { name: 'ID', value: id, inline: true },
        ])
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message) {
        const user = message.mentions.users.first();
        const channel = message.mentions.channels.first();
        const role = message.mentions.roles.first();
        let id = '';
        let name = '';
        if (user) {
            id = user.id;
            name = user.username;
        }
        else if (channel) {
            id = channel.id;
            name = channel.name;
        }
        else if (role) {
            id = role.id;
            name = role.name;
        }
        else {
            id = message.author.id;
            name = message.author.username;
        }
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.info} ID Information`)
            .setColor(COLORS.info)
            .addFields([
            { name: 'Name', value: name, inline: true },
            { name: 'ID', value: id, inline: true },
        ])
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default IdCommand;
