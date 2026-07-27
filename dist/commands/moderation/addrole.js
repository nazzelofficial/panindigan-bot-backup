// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class AddRoleCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'addrole',
            description: 'Add a role to a user',
            category: 'moderation',
            cooldown: 3,
            userPermissions: [PermissionFlagsBits.ManageRoles],
            botPermissions: [PermissionFlagsBits.ManageRoles],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['giverole', 'roleadd'],
            examples: ['/addrole @user @role', 'p!addrole @user @role'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const target = interaction.options.getUser('target');
        const role = interaction.options.getRole('role');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        if (!target) {
            await interaction.reply({ content: '❌ Please provide a user.', ephemeral: true });
            return;
        }
        if (!role) {
            await interaction.reply({ content: '❌ Please provide a role.', ephemeral: true });
            return;
        }
        if (!interaction.guild)
            return;
        const member = await interaction.guild.members.fetch(target.id).catch(() => null);
        if (!member) {
            await interaction.reply({ content: '❌ User not found in server.', ephemeral: true });
            return;
        }
        if (member.roles.cache.has(role.id)) {
            await interaction.reply({ content: '❌ User already has this role.', ephemeral: true });
            return;
        }
        if (!member.manageable) {
            await interaction.reply({ content: '❌ I cannot add roles to this user due to role hierarchy.', ephemeral: true });
            return;
        }
        try {
            await member.roles.add(role, reason);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.success} Role Added`)
                .setColor(COLORS.success)
                .addFields([
                { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
                { name: 'Role', value: role.name, inline: true },
                { name: 'Moderator', value: interaction.user.tag, inline: true },
                { name: 'Reason', value: reason, inline: false },
            ])
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }
        catch (error) {
            await interaction.reply({ content: '❌ Failed to add role.', ephemeral: true });
        }
    }
    async executePrefix(message, _args) {
        const target = message.mentions.users.first();
        const role = message.mentions.roles.first();
        const reason = _args.slice(2).join(' ') || 'No reason provided';
        if (!target) {
            await message.reply('❌ Please mention a user.');
            return;
        }
        if (!role) {
            await message.reply('❌ Please mention a role.');
            return;
        }
        if (!message.guild)
            return;
        const member = await message.guild.members.fetch(target.id).catch(() => null);
        if (!member) {
            await message.reply('❌ User not found in server.');
            return;
        }
        if (member.roles.cache.has(role.id)) {
            await message.reply('❌ User already has this role.');
            return;
        }
        if (!member.manageable) {
            await message.reply('❌ I cannot add roles to this user due to role hierarchy.');
            return;
        }
        try {
            await member.roles.add(role, reason);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.success} Role Added`)
                .setColor(COLORS.success)
                .addFields([
                { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
                { name: 'Role', value: role.name, inline: true },
                { name: 'Moderator', value: message.author.tag, inline: true },
                { name: 'Reason', value: reason, inline: false },
            ])
                .setTimestamp();
            await message.reply({ embeds: [embed] });
        }
        catch (error) {
            await message.reply('❌ Failed to add role.');
        }
    }
}
export default AddRoleCommand;
