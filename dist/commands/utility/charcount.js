// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class CharcountCommand extends BaseCommand {
    constructor() {
        super({
            name: 'charcount',
            description: 'Count characters, words, lines, and sentences in text',
            category: 'utility',
            premiumTier: 'free',
            cooldown: 5,
            ownerOnly: false,
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['cc', 'wordcount', 'wc'],
            examples: ['p!charcount Hello World', 'p!wc This is some text'],
        });
    }
    buildSlashCommand() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .setDMPermission(false)
            .addStringOption(opt => opt.setName('text').setDescription('Text to analyse').setRequired(false));
    }
    analyse(text) {
        const chars = text.length;
        const charsNoSpaces = text.replace(/\s/g, '').length;
        const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
        const lines = text.split(/\r?\n/).length;
        const sentences = (text.match(/[^.!?]*[.!?]+/g) || []).length;
        return new EmbedBuilder()
            .setTitle(`${EMOJIS.utility} Text Analysis`)
            .setColor(COLORS.default)
            .addFields({ name: 'Characters (with spaces)', value: `\`${chars}\``, inline: true }, { name: 'Characters (no spaces)', value: `\`${charsNoSpaces}\``, inline: true }, { name: 'Words', value: `\`${words}\``, inline: true }, { name: 'Lines', value: `\`${lines}\``, inline: true }, { name: 'Sentences', value: `\`${sentences}\``, inline: true })
            .setTimestamp();
    }
    async executeSlash(i) {
        try {
            const text = i.options.getString('text');
            if (!text) {
                await i.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`${EMOJIS.error} Please provide text to analyse.`)], ephemeral: true });
                return;
            }
            await i.reply({ embeds: [this.analyse(text)] });
        }
        catch (err) {
            await i.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`${EMOJIS.error} An error occurred.`)], ephemeral: true });
        }
    }
    async executePrefix(m, _args) {
        try {
            let text = _args.join(' ');
            // If no _args, check for a replied message
            if (!text && m.reference?.messageId) {
                const replied = await m.channel.messages.fetch(m.reference.messageId).catch(() => null);
                if (replied)
                    text = replied.content;
            }
            if (!text) {
                await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`${EMOJIS.error} Please provide text or reply to a message.\nExample: \`p!charcount Hello World\``)] });
                return;
            }
            await m.reply({ embeds: [this.analyse(text)] });
        }
        catch (err) {
            await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`${EMOJIS.error} An error occurred.`)] });
        }
    }
}
export default CharcountCommand;
