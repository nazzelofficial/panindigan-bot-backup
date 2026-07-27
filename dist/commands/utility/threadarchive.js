// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class ThreadarchiveCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'threadarchive',
            description: 'Archive the current thread',
            category: 'utility',
            premiumTier: 'free',
            cooldown: 5,
            userPermissions: [PermissionFlagsBits.ManageThreads],
            botPermissions: [PermissionFlagsBits.ManageThreads],
            ownerOnly: false,
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['archivethread'],
            examples: ['/threadarchive', 'p!threadarchive'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const channel = interaction.channel;
        if (!channel || !channel.isThread()) {
            const embed = new EmbedBuilder()
                .setColor(COLORS.error)
                .setTitle(`${EMOJIS.error} Not a Thread`)
                .setDescription('This command can only be used inside a thread.');
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }
        const thread = channel;
        try {
            await thread.setArchived(true);
            const embed = new EmbedBuilder()
                .setColor(COLORS.success)
                .setTitle(`${EMOJIS.success} Thread Archived`)
                .setDescription(`Thread **${thread.name}** has been archived.`)
                .setTimestamp();
            await interaction.reply({ embeds: [embed] });
        }
        catch {
            const embed = new EmbedBuilder()
                .setColor(COLORS.error)
                .setTitle(`${EMOJIS.error} Archive Failed`)
                .setDescription('Could not archive this thread.');
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
    async executePrefix(message, _args) {
        const channel = message.channel;
        if (!channel.isThread()) {
            const embed = new EmbedBuilder()
                .setColor(COLORS.error)
                .setTitle(`${EMOJIS.error} Not a Thread`)
                .setDescription('This command can only be used inside a thread.');
            await message.reply({ embeds: [embed] });
            return;
        }
        const thread = channel;
        try {
            const embed = new EmbedBuilder()
                .setColor(COLORS.success)
                .setTitle(`${EMOJIS.success} Thread Archived`)
                .setDescription(`Thread **${thread.name}** has been archived.`)
                .setTimestamp();
            await message.reply({ embeds: [embed] });
            await thread.setArchived(true);
        }
        catch {
            const embed = new EmbedBuilder()
                .setColor(COLORS.error)
                .setTitle(`${EMOJIS.error} Archive Failed`)
                .setDescription('Could not archive this thread.');
            await message.reply({ embeds: [embed] });
        }
    }
}
export default ThreadarchiveCommand;
