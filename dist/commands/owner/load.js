// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import * as path from 'path';
export class LoadCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'load',
            description: 'Dynamically load a command file (Owner only)',
            category: 'owner',
            premiumTier: 'free',
            cooldown: 0,
            userPermissions: [],
            botPermissions: [],
            ownerOnly: true,
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['loadcmd'],
            examples: ['/load src/commands/owner/test.ts', 'p!load src/commands/owner/test.ts'],
        };
        super(options);
    }
    async loadFile(filePath) {
        try {
            const resolvedPath = path.resolve(process.cwd(), filePath);
            // Clear the module cache for hot loading
            // Note: ESM doesn't support require.cache clearing
            const imported = await import(resolvedPath);
            const CommandClass = imported.default || Object.values(imported)[0];
            if (!CommandClass) {
                return { success: false, error: 'No default export found in file.' };
            }
            const instance = new CommandClass();
            return { success: true, commandName: instance?.name || path.basename(filePath) };
        }
        catch (err) {
            return { success: false, error: err?.message || 'Unknown error' };
        }
    }
    async executeSlash(interaction) {
        const filePath = interaction.options.getString('path', true);
        await interaction.deferReply({ ephemeral: true });
        const { success, commandName, error } = await this.loadFile(filePath);
        const embed = new EmbedBuilder()
            .setColor(success ? COLORS.success : COLORS.error)
            .setTitle(`${success ? EMOJIS.success : EMOJIS.error} Command Load`)
            .setDescription(success
            ? `Successfully loaded command: \`${commandName}\``
            : `Failed to load file: \`${filePath}\`\n\`\`\`\n${error}\n\`\`\``)
            .addFields({ name: '📂 File Path', value: `\`${filePath}\``, inline: false })
            .setFooter({ text: `Requested by ${interaction.user.tag}` })
            .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
    }
    async executePrefix(message, _args) {
        const filePath = _args[0];
        if (!filePath) {
            await message.reply(`${EMOJIS.error} Please provide a file path to load.`);
            return;
        }
        const { success, commandName, error } = await this.loadFile(filePath);
        const embed = new EmbedBuilder()
            .setColor(success ? COLORS.success : COLORS.error)
            .setTitle(`${success ? EMOJIS.success : EMOJIS.error} Command Load`)
            .setDescription(success
            ? `Successfully loaded command: \`${commandName}\``
            : `Failed to load file: \`${filePath}\`\n\`\`\`\n${error}\n\`\`\``)
            .addFields({ name: '📂 File Path', value: `\`${filePath}\``, inline: false })
            .setFooter({ text: `Requested by ${message.author.tag}` })
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default LoadCommand;
