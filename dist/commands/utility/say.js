// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class SayCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'say',
            description: 'Make the bot say something',
            category: 'utility',
            cooldown: 5,
            userPermissions: [PermissionFlagsBits.ManageMessages],
            botPermissions: [],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: [],
            examples: ['/say Hello everyone!', 'p!say Important announcement'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const text = interaction.options.getString('text');
        if (!text) {
            const errorEmbed = new EmbedBuilder()
                .setTitle(`${EMOJIS.error} Error`)
                .setColor(COLORS.error)
                .setDescription('Please provide text for the bot to say.')
                .setTimestamp();
            await interaction.reply({ embeds: [errorEmbed] });
            return;
        }
        await interaction.channel?.send(text);
        await interaction.reply({ content: 'Message sent!', ephemeral: true });
    }
    async executePrefix(message) {
        const _args = message.content.split(' ').slice(1);
        const text = _args.join(' ');
        if (!text) {
            const errorEmbed = new EmbedBuilder()
                .setTitle(`${EMOJIS.error} Error`)
                .setColor(COLORS.error)
                .setDescription('Please provide text for the bot to say.')
                .setTimestamp();
            await message.reply({ embeds: [errorEmbed] });
            return;
        }
        await message.channel.send(text);
        await message.delete();
    }
}
export default SayCommand;
