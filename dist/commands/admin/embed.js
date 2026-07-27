// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
export class EmbedCommand extends BaseCommand {
    constructor() {
        super({ name: 'embed', description: 'Create a simple embed message', category: 'admin', premiumTier: 'free', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, userPermissions: [PermissionFlagsBits.ManageMessages], aliases: ['createembed', 'sendembed'], examples: ['/embed title:"Hello" description:"World"', 'p!embed Hello World'] });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
            .addStringOption(o => o.setName('description').setDescription('Embed content').setRequired(true).setMaxLength(2000))
            .addStringOption(o => o.setName('title').setDescription('Embed title').setRequired(false).setMaxLength(256))
            .addStringOption(o => o.setName('color').setDescription('Embed color (hex, e.g. #FF0000)').setRequired(false))
            .addStringOption(o => o.setName('footer').setDescription('Footer text').setRequired(false).setMaxLength(2048))
            .addStringOption(o => o.setName('image').setDescription('Image URL').setRequired(false))
            .addChannelOption(o => o.setName('channel').setDescription('Channel to send to (default: current)').setRequired(false))
            .setDMPermission(false));
    }
    parseColor(colorStr) {
        if (!colorStr)
            return COLORS.default;
        const hex = colorStr.replace('#', '');
        const parsed = parseInt(hex, 16);
        return isNaN(parsed) ? COLORS.default : parsed;
    }
    async executeSlash(i) {
        const description = i.options.getString('description', true);
        const title = i.options.getString('title');
        const colorStr = i.options.getString('color');
        const footer = i.options.getString('footer');
        const imageUrl = i.options.getString('image');
        const targetChannel = i.options.getChannel('channel');
        const embed = new EmbedBuilder()
            .setDescription(description)
            .setColor(this.parseColor(colorStr));
        if (title)
            embed.setTitle(title);
        if (footer)
            embed.setFooter({ text: footer });
        if (imageUrl)
            embed.setImage(imageUrl);
        try {
            const ch = targetChannel ? i.guild.channels.cache.get(targetChannel.id) : i.channel;
            if (ch?.isTextBased()) {
                await ch.send({ embeds: [embed] });
                if (ch.id !== i.channelId)
                    await i.reply({ content: `✅ Embed sent to ${ch}!`, ephemeral: true });
                else
                    await i.reply({ content: '✅ Embed sent!', ephemeral: true });
            }
            else {
                await i.reply({ embeds: [embed] });
            }
        }
        catch {
            await i.reply({ embeds: [embed] });
        }
    }
    async executePrefix(m, _args) {
        if (!args.length) {
            await m.reply('❌ Usage: `p!embed <message>`');
            return;
        }
        const embed = new EmbedBuilder()
            .setDescription(args.join(' '))
            .setColor(COLORS.default)
            .setFooter({ text: `Sent by ${m.author.tag}` });
        await m.channel.send({ embeds: [embed] });
        await m.delete().catch(() => null);
    }
}
export default EmbedCommand;
