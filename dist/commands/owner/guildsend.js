// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
export class GuildSendCommand extends BaseCommand {
    constructor() {
        super({
            name: 'guildsend',
            description: 'Send a message to a channel in any guild',
            category: 'owner',
            premiumTier: 'free',
            cooldown: 0,
            ownerOnly: true,
            guildOnly: false,
            slashCommand: false,
            prefixCommand: true,
            aliases: ['gsend'],
            examples: ['p!guildsend 123456789 987654321 Hello world!'],
        });
    }
    buildSlashCommand() {
        return new SlashCommandBuilder().setName(this.name).setDescription(this.description).setDMPermission(false);
    }
    async executeSlash(i) {
        await i.reply({ content: 'Use prefix command `p!guildsend <guildId> <channelId> <message>` for this.', ephemeral: true });
    }
    async executePrefix(m, _args) {
        try {
            if (args.length < 3) {
                await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Usage: `p!guildsend <guildId> <channelId> <message...>`')] });
                return;
            }
            const [guildId, channelId, ...msgParts] = _args;
            const text = msgParts.join(' ');
            const guild = m.client.guilds.cache.get(guildId);
            if (!guild) {
                await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ Guild \`${guildId}\` not found.`)] });
                return;
            }
            const channel = guild.channels.cache.get(channelId);
            if (!channel || !channel.send) {
                await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ Channel \`${channelId}\` not found or not sendable.`)] });
                return;
            }
            await channel.send(text);
            const embed = new EmbedBuilder()
                .setTitle('📨 Message Sent')
                .setColor(COLORS.success)
                .addFields({ name: 'Guild', value: `${guild.name} (\`${guild.id}\`)`, inline: true }, { name: 'Channel', value: `#${channel.name} (\`${channel.id}\`)`, inline: true }, { name: 'Message', value: text.slice(0, 1024), inline: false })
                .setTimestamp();
            await m.reply({ embeds: [embed] });
        }
        catch (err) {
            await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ Error: ${err?.message}`)] });
        }
    }
}
export default GuildSendCommand;
