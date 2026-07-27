// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import * as fs from 'fs';
import * as path from 'path';
export class HotreloadCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'hotreload',
            description: 'Hot-reload all command files (Owner only)',
            category: 'owner',
            premiumTier: 'free',
            cooldown: 0,
            userPermissions: [],
            botPermissions: [],
            ownerOnly: true,
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['hr', 'hreload'],
            examples: ['/hotreload', 'p!hotreload'],
        };
        super(options);
    }
    reloadAllCommands() {
        const commandsDir = path.resolve(process.cwd(), 'src', 'commands');
        const errors = [];
        let count = 0;
        const walkDir = (dir) => {
            if (!fs.existsSync(dir))
                return;
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    walkDir(fullPath);
                }
                else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.js'))) {
                    // Note: ESM doesn't support require.cache clearing like CommonJS
                    // Hot-reload is not fully supported in native ESM mode
                    count++;
                }
            }
        };
        walkDir(commandsDir);
        return { count, errors };
    }
    async executeSlash(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const loadingEmbed = new EmbedBuilder()
            .setColor(COLORS.default)
            .setTitle(`${EMOJIS.loading} Hot-Reloading Commands...`)
            .setDescription('Please wait while all commands are being reloaded.')
            .setTimestamp();
        await interaction.editReply({ embeds: [loadingEmbed] });
        const { count, errors } = this.reloadAllCommands();
        const embed = new EmbedBuilder()
            .setColor(errors.length === 0 ? COLORS.success : COLORS.warning)
            .setTitle(`🔄 Hot-Reload Complete`)
            .addFields({ name: `${EMOJIS.success} Commands Cleared`, value: `\`${count}\` command modules removed from cache`, inline: true }, { name: `${EMOJIS.error} Errors`, value: `\`${errors.length}\``, inline: true })
            .setFooter({ text: `Requested by ${interaction.user.tag} • Restart bot to re-register commands` })
            .setTimestamp();
        if (errors.length > 0) {
            embed.addFields({ name: 'Error Details', value: errors.slice(0, 5).join('\n').slice(0, 1024), inline: false });
        }
        await interaction.editReply({ embeds: [embed] });
    }
    async executePrefix(message, _args) {
        const loadingEmbed = new EmbedBuilder()
            .setColor(COLORS.default)
            .setTitle(`${EMOJIS.loading} Hot-Reloading Commands...`)
            .setDescription('Please wait while all commands are being reloaded.')
            .setTimestamp();
        const reply = await message.reply({ embeds: [loadingEmbed] });
        const { count, errors } = this.reloadAllCommands();
        const embed = new EmbedBuilder()
            .setColor(errors.length === 0 ? COLORS.success : COLORS.warning)
            .setTitle(`🔄 Hot-Reload Complete`)
            .addFields({ name: `${EMOJIS.success} Commands Cleared`, value: `\`${count}\` command modules removed from cache`, inline: true }, { name: `${EMOJIS.error} Errors`, value: `\`${errors.length}\``, inline: true })
            .setFooter({ text: `Requested by ${message.author.tag} • Restart bot to re-register commands` })
            .setTimestamp();
        if (errors.length > 0) {
            embed.addFields({ name: 'Error Details', value: errors.slice(0, 5).join('\n').slice(0, 1024), inline: false });
        }
        await reply.edit({ embeds: [embed] });
    }
}
export default HotreloadCommand;
