// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class RoleListCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'rolelist',
            description: 'List all roles in the server',
            category: 'moderation',
            cooldown: 5,
            userPermissions: [PermissionFlagsBits.ManageRoles],
            botPermissions: [PermissionFlagsBits.ManageRoles],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['roles', 'listroles'],
            examples: ['/rolelist', 'p!rolelist'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        await this.showRoleList(interaction);
    }
    async executePrefix(message) {
        await this.showRoleList(message);
    }
    async showRoleList(interaction) {
        if (!interaction.guild)
            return;
        const roles = interaction.guild.roles.cache
            .sort((a, b) => b.position - a.position)
            .filter(role => role.id !== interaction.guild.id);
        const roleList = roles.map(role => {
            const memberCount = role.members.size;
            return `${role.name} (${memberCount} members)`;
        }).join('\n');
        const chunks = this.chunkString(roleList, 1024);
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.info} Server Roles`)
            .setColor(COLORS.info)
            .addFields([
            { name: 'Total Roles', value: roles.size.toString(), inline: true },
            { name: 'Roles', value: chunks[0], inline: false },
        ])
            .setTimestamp();
        if (interaction instanceof ChatInputCommandInteraction) {
            await interaction.reply({ embeds: [embed] });
        }
        else {
            await interaction.reply({ embeds: [embed] });
        }
        for (let i = 1; i < chunks.length; i++) {
            const followUpEmbed = new EmbedBuilder()
                .setColor(COLORS.info)
                .addFields({ name: 'Roles (continued)', value: chunks[i] });
            if (interaction instanceof ChatInputCommandInteraction) {
                await interaction.followUp({ embeds: [followUpEmbed] });
            }
            else {
                await interaction.channel.send({ embeds: [followUpEmbed] });
            }
        }
    }
    chunkString(str, length) {
        const chunks = [];
        let currentChunk = '';
        const lines = str.split('\n');
        for (const line of lines) {
            if (currentChunk.length + line.length + 1 > length) {
                chunks.push(currentChunk);
                currentChunk = line;
            }
            else {
                currentChunk += (currentChunk ? '\n' : '') + line;
            }
        }
        if (currentChunk) {
            chunks.push(currentChunk);
        }
        return chunks;
    }
}
export default RoleListCommand;
