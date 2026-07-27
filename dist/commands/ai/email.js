// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder, } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
const TONES = ['professional', 'formal', 'casual', 'friendly', 'apologetic', 'persuasive', 'thankful'];
export class EmailCommand extends BaseCommand {
    constructor() {
        super({
            name: 'email',
            description: 'Generate a professional email using AI',
            category: 'ai',
            premiumTier: 'silver',
            cooldown: 15,
            userPermissions: [],
            botPermissions: [],
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['generateemail', 'mail', 'draftemail'],
            examples: [
                '/email topic:Request a meeting tone:professional',
                'p!email professional Request a meeting with the team',
            ],
        });
    }
    buildSlashCommand() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(o => o.setName('topic')
            .setDescription('What the email is about (e.g. "request a meeting", "thank you note")')
            .setRequired(true)
            .setMaxLength(300))
            .addStringOption(o => o.setName('tone')
            .setDescription('Tone of the email (default: professional)')
            .setRequired(false)
            .addChoices({ name: 'Professional', value: 'professional' }, { name: 'Formal', value: 'formal' }, { name: 'Casual', value: 'casual' }, { name: 'Friendly', value: 'friendly' }, { name: 'Apologetic', value: 'apologetic' }, { name: 'Persuasive', value: 'persuasive' }, { name: 'Thankful', value: 'thankful' }))
            .addStringOption(o => o.setName('recipient')
            .setDescription('Who the email is addressed to (e.g. "my boss", "a client")')
            .setRequired(false)
            .setMaxLength(100));
    }
    async generateEmail(client, topic, tone, recipient) {
        const systemPrompt = `You are a professional email writing assistant. 
Generate a complete, well-structured email based on the user's request.
The email must include:
- Subject line (prefixed with "Subject: ")
- Proper greeting
- Clear, concise body with proper paragraphs
- Professional closing and signature placeholder

Tone: ${tone}
Recipient context: ${recipient || 'not specified'}

Keep the email between 150–400 words. Write the full email, ready to send.`;
        const response = await client.aiHandler.generateTaskResponse(`Write a ${tone} email about: ${topic}`, systemPrompt);
        return response.content;
    }
    async executeSlash(interaction) {
        const topic = interaction.options.getString('topic', true);
        const tone = interaction.options.getString('tone') || 'professional';
        const recipient = interaction.options.getString('recipient') || '';
        await interaction.deferReply();
        try {
            const client = interaction.client;
            const emailText = await this.generateEmail(client, topic, tone, recipient);
            // Split at 4000 chars for embed limit
            const truncated = emailText.length > 4000 ? emailText.slice(0, 3997) + '...' : emailText;
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} 📧 AI Email Generator`)
                .setColor(COLORS.info)
                .addFields({ name: '📌 Topic', value: topic.slice(0, 256), inline: true }, { name: '🎭 Tone', value: tone.charAt(0).toUpperCase() + tone.slice(1), inline: true }, ...(recipient ? [{ name: '👤 Recipient', value: recipient.slice(0, 100), inline: true }] : []), { name: '✉️ Generated Email', value: `\`\`\`\n${truncated}\n\`\`\`` })
                .setFooter({ text: `${EMOJIS.ai} Powered by AI — Edit before sending` })
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        }
        catch (err) {
            const errMsg = err?.message || 'AI provider is unavailable. Please try again later.';
            await interaction.editReply({
                content: `${EMOJIS.error} Failed to generate email: ${errMsg}`,
            });
        }
    }
    async executePrefix(message, _args) {
        if (!args.length) {
            return void message.reply(`${EMOJIS.error} Usage: \`p!email <tone> <topic>\`\nTones: ${TONES.join(', ')}\nExample: \`p!email professional Request a meeting\``);
        }
        let tone = 'professional';
        let topicArgs = _args;
        if (TONES.includes(args[0].toLowerCase())) {
            tone = args[0].toLowerCase();
            topicArgs = _args.slice(1);
        }
        const topic = topicArgs.join(' ');
        if (!topic) {
            return void message.reply(`${EMOJIS.error} Please provide a topic. Example: \`p!email professional Request a meeting\``);
        }
        const thinking = await message.reply(`${EMOJIS.loading} Drafting your email...`);
        try {
            const client = message.client;
            const emailText = await this.generateEmail(client, topic, tone, '');
            const truncated = emailText.length > 4000 ? emailText.slice(0, 3997) + '...' : emailText;
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.ai} 📧 AI Email Generator`)
                .setColor(COLORS.info)
                .addFields({ name: '📌 Topic', value: topic.slice(0, 256), inline: true }, { name: '🎭 Tone', value: tone.charAt(0).toUpperCase() + tone.slice(1), inline: true }, { name: '✉️ Generated Email', value: `\`\`\`\n${truncated}\n\`\`\`` })
                .setFooter({ text: `${EMOJIS.ai} Powered by AI — Edit before sending` })
                .setTimestamp();
            await thinking.edit({ content: null, embeds: [embed] });
        }
        catch (err) {
            const errMsg = err?.message || 'AI provider is unavailable. Please try again later.';
            await thinking.edit(`${EMOJIS.error} Failed to generate email: ${errMsg}`);
        }
    }
}
export default EmailCommand;
