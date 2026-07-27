// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class EnableCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'enable',
            description: 'Enable a previously disabled command in this server',
            category: 'admin',
            cooldown: 3,
            userPermissions: [PermissionFlagsBits.Administrator],
            botPermissions: [PermissionFlagsBits.ManageGuild],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['enablecmd', 'enablecommand'],
            examples: ['/enable play', 'p!enable play'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const commandName = interaction.options.getString('command');
        if (!commandName) {
            await interaction.reply({ content: '❌ Please provide a command name to enable.', ephemeral: true });
            return;
        }
        if (!interaction.guild)
            return;
        const prisma = getPrismaClient();
        const guild = await prisma.guild.findUnique({
            where: { guildId: interaction.guild.id },
        });
        const disabledCommands = guild?.disabledCommands || [];
        if (!disabledCommands.includes(commandName)) {
            await interaction.reply({ content: '❌ This command is not disabled.', ephemeral: true });
            return;
        }
        await prisma.guild.update({
            where: { guildId: interaction.guild.id },
            data: { disabledCommands: disabledCommands.filter(c => c !== commandName) },
        });
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.success} Command Enabled`)
            .setColor(COLORS.success)
            .addFields([
            { name: 'Command', value: commandName, inline: true },
            { name: 'Enabled by', value: interaction.user.tag, inline: true },
        ])
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    }
    async executePrefix(message, _args) {
        const commandName = args[0];
        if (!commandName) {
            await message.reply('❌ Please provide a command name to enable.');
            return;
        }
        if (!message.guild)
            return;
        const prisma = getPrismaClient();
        const guild = await prisma.guild.findUnique({
            where: { guildId: message.guild.id },
        });
        const disabledCommands = guild?.disabledCommands || [];
        if (!disabledCommands.includes(commandName)) {
            await message.reply('❌ This command is not disabled.');
            return;
        }
        await prisma.guild.update({
            where: { guildId: message.guild.id },
            data: { disabledCommands: disabledCommands.filter(c => c !== commandName) },
        });
        const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.success} Command Enabled`)
            .setColor(COLORS.success)
            .addFields([
            { name: 'Command', value: commandName, inline: true },
            { name: 'Enabled by', value: message.author.tag, inline: true },
        ])
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default EnableCommand;
