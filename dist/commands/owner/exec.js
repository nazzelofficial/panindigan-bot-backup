// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);
export class ExecCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'exec',
            description: 'Execute a shell command (Owner only)',
            category: 'owner',
            premiumTier: 'free',
            cooldown: 0,
            userPermissions: [],
            botPermissions: [],
            ownerOnly: true,
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['shell', 'sh'],
            examples: ['/exec ls -la', 'p!exec ls -la'],
        };
        super(options);
    }
    async runCommand(cmd) {
        try {
            const { stdout, stderr } = await execAsync(cmd, { timeout: 15000 });
            return { stdout: stdout || '(no output)', stderr: stderr || '', success: true };
        }
        catch (err) {
            return { stdout: err?.stdout || '', stderr: err?.stderr || err?.message || 'Unknown error', success: false };
        }
    }
    async executeSlash(interaction) {
        const cmd = interaction.options.getString('command', true);
        await interaction.deferReply({ ephemeral: true });
        const { stdout, stderr, success } = await this.runCommand(cmd);
        const output = (stdout + (stderr ? `\nSTDERR:\n${stderr}` : '')).slice(0, 1900);
        const embed = new EmbedBuilder()
            .setColor(success ? COLORS.success : COLORS.error)
            .setTitle(`${success ? EMOJIS.success : EMOJIS.error} Shell Execution`)
            .addFields({ name: '📥 Command', value: `\`\`\`bash\n${cmd.slice(0, 512)}\n\`\`\``, inline: false }, { name: '📤 Output', value: `\`\`\`\n${output}\n\`\`\``, inline: false })
            .setFooter({ text: `Requested by ${interaction.user.tag}` })
            .setTimestamp();
        await interaction.editReply({ embeds: [embed] });
    }
    async executePrefix(message, _args) {
        const cmd = _args.join(' ');
        if (!cmd) {
            await message.reply(`${EMOJIS.error} Please provide a command to execute.`);
            return;
        }
        const { stdout, stderr, success } = await this.runCommand(cmd);
        const output = (stdout + (stderr ? `\nSTDERR:\n${stderr}` : '')).slice(0, 1900);
        const embed = new EmbedBuilder()
            .setColor(success ? COLORS.success : COLORS.error)
            .setTitle(`${success ? EMOJIS.success : EMOJIS.error} Shell Execution`)
            .addFields({ name: '📥 Command', value: `\`\`\`bash\n${cmd.slice(0, 512)}\n\`\`\``, inline: false }, { name: '📤 Output', value: `\`\`\`\n${output}\n\`\`\``, inline: false })
            .setFooter({ text: `Requested by ${message.author.tag}` })
            .setTimestamp();
        await message.reply({ embeds: [embed] });
    }
}
export default ExecCommand;
