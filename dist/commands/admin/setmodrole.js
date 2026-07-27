// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class SetModRoleCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'setmodrole',
            description: 'Set the moderator role for the server',
            category: 'admin',
            cooldown: 5,
            userPermissions: [PermissionFlagsBits.Administrator],
            botPermissions: [PermissionFlagsBits.ManageRoles],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['modrole', 'setmoderator'],
            examples: ['/setmodrole @Moderator', 'p!setmodrole @Moderator'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const role = interaction.options.getRole('role');
        if (!role) {
            await interaction.reply({ content: '❌ Please provide a role.', ephemeral: true });
            return;
        }
        if (!interaction.guild)
            return;
        const prisma = getPrismaClient();
        await prisma.guild.update({
            where: { guildId: interaction.guild.id },
            data: { modRoleId: role.id },
        });
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.success} Moderator Role Set`)
            .setColor(COLORS.success)
            .addFields([
            { name: 'Role', value: role.toString(), inline: true },
            { name: 'Updated by', value: interaction.user.tag, inline: true },
        ])
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message, _args) {
        const role = message.mentions.roles.first();
        if (!role) {
            await message.reply('❌ Please mention a role.');
            return;
        }
        if (!message.guild)
            return;
        const prisma = getPrismaClient();
        await prisma.guild.update({
            where: { guildId: message.guild.id },
            data: { modRoleId: role.id },
        });
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.success} Moderator Role Set`)
            .setColor(COLORS.success)
            .addFields([
            { name: 'Role', value: role.toString(), inline: true },
            { name: 'Updated by', value: message.author.tag, inline: true },
        ])
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default SetModRoleCommand;
