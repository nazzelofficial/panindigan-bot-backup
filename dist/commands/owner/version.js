// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, version as djsVersion } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class VersionCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'version',
            description: 'Show bot version info (Owner only)',
            category: 'owner',
            premiumTier: 'free',
            cooldown: 0,
            userPermissions: [],
            botPermissions: [],
            ownerOnly: true,
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['ver', 'botversion'],
            examples: ['/version', 'p!version'],
        };
        super(options);
    }
    formatUptime(ms) {
        const s = Math.floor(ms / 1000);
        const d = Math.floor(s / 86400);
        const h = Math.floor((s % 86400) / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        return `${d}d ${h}h ${m}m ${sec}s`;
    }
    buildEmbed(client, requesterTag) {
        const uptimeMs = client.uptime ?? 0;
        const shardCount = client.shard?.count ?? 1;
        return new EmbedBuilder()
            .setColor(COLORS.default)
            .setTitle(`${EMOJIS.owner} Bot Version Info`)
            .addFields({ name: '🤖 Bot Version', value: '`0.1`', inline: true }, { name: '🟢 Node.js', value: `\`${process.version}\``, inline: true }, { name: '📦 discord.js', value: `\`v${djsVersion}\``, inline: true }, { name: '⏱️ Uptime', value: this.formatUptime(uptimeMs), inline: true }, { name: '🔀 Shards', value: `\`${shardCount}\``, inline: true }, { name: '🏠 Guilds', value: `\`${client.guilds.cache.size}\``, inline: true }, { name: '🖥️ Platform', value: `\`${process.platform} ${process.arch}\``, inline: true }, { name: '🔢 PID', value: `\`${process.pid}\``, inline: true })
            .setFooter({ text: `Requested by ${requesterTag}` })
            .setTimestamp();
    }
    async executeSlash(interaction) {
        const embed = this.buildEmbed(interaction.client, interaction.user.tag);
        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
    async executePrefix(message, _args) {
        const embed = this.buildEmbed(message.client, message.author.tag);
        await message.reply({ embeds: [embed] });
    }
}
export default VersionCommand;
