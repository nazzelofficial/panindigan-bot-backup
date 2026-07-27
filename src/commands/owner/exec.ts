// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class ExecCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
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

  private async runCommand(cmd: string): Promise<{ stdout: string; stderr: string; success: boolean }> {
    try {
      const { stdout, stderr } = await execAsync(cmd, { timeout: 15000 });
      return { stdout: stdout || '(no output)', stderr: stderr || '', success: true };
    } catch (err: any) {
      return { stdout: err?.stdout || '', stderr: err?.stderr || err?.message || 'Unknown error', success: false };
    }
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const cmd = interaction.options.getString('command', true);
    await interaction.deferReply({ ephemeral: true });

    const { stdout, stderr, success } = await this.runCommand(cmd);

    const output = (stdout + (stderr ? `\nSTDERR:\n${stderr}` : '')).slice(0, 1900);

    const embed = new EmbedBuilder()
      .setColor(success ? COLORS.success : COLORS.error)
      .setTitle(`${success ? EMOJIS.success : EMOJIS.error} Shell Execution`)
      .addFields(
        { name: '📥 Command', value: `\`\`\`bash\n${cmd.slice(0, 512)}\n\`\`\``, inline: false },
        { name: '📤 Output', value: `\`\`\`\n${output}\n\`\`\``, inline: false },
      )
      .setFooter({ text: `Requested by ${interaction.user.tag}` })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
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
      .addFields(
        { name: '📥 Command', value: `\`\`\`bash\n${cmd.slice(0, 512)}\n\`\`\``, inline: false },
        { name: '📤 Output', value: `\`\`\`\n${output}\n\`\`\``, inline: false },
      )
      .setFooter({ text: `Requested by ${message.author.tag}` })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default ExecCommand;
