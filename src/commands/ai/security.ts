import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { PanindiganClient } from '../../structures/PanindiganClient';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class SecurityCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'security',
      description: 'Analyze code for security vulnerabilities using AI',
      category: 'ai',
      cooldown: 10,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['seccheck', 'vuln'],
      examples: ['/security code to audit', 'p!security paste code here'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o => o.setName('code').setDescription('Code to audit for security').setRequired(true).setMaxLength(2000)) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const code = interaction.options.getString('code', true);
    await interaction.deferReply();
    try {
      const client = interaction.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        code,
        'You are a security expert (OWASP certified). Audit the code for vulnerabilities: 1) SQL injection. 2) XSS vulnerabilities. 3) Authentication/authorization flaws. 4) Insecure data handling. 5) Hardcoded secrets. 6) Other OWASP Top 10 issues. For each finding: severity (Critical/High/Medium/Low), description, and secure fix.'
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 🔒 Security Audit`)
        .setColor(COLORS.error)
        .addFields(
          { name: '💻 Code', value: `\`\`\`\n${code.slice(0, 600)}\n\`\`\``, inline: false },
          { name: '🛡️ Security Report', value: response.content.slice(0, 3400), inline: false }
        )
        .setFooter({ text: `Provider: ${response.provider}` })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (err: any) {
      await interaction.editReply({ content: `${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}` });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const code = args.join(' ');
    if (!code) return void message.reply(`${EMOJIS.error} Please provide code to audit.`);
    const thinking = await message.reply(`${EMOJIS.ai} Auditing security...`);
    try {
      const client = message.client as PanindiganClient;
      const response = await client.aiHandler.generateTaskResponse(
        code,
        'Security audit: check for SQL injection, XSS, auth flaws, insecure data handling, hardcoded secrets, OWASP Top 10. Severity + fix for each finding.'
      );
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.ai} 🔒 Security Audit`)
        .setColor(COLORS.error)
        .addFields({ name: '🛡️ Security Report', value: response.content.slice(0, 3800), inline: false })
        .setFooter({ text: `Provider: ${response.provider}` })
        .setTimestamp();
      await thinking.edit({ content: null, embeds: [embed] });
    } catch (err: any) {
      await thinking.edit(`${EMOJIS.error} Error: ${err.message || 'AI unavailable.'}`);
    }
  }
}

export default SecurityCommand;
