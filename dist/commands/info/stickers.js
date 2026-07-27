// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class StickersCommand extends BaseCommand {
    constructor() {
        super({
            name: 'stickers',
            description: 'View all custom stickers in this server',
            category: 'info',
            premiumTier: 'silver',
            cooldown: 5,
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['serverstickers', 'stickerlist'],
            examples: ['/stickers', 'p!stickers'],
        });
    }
    async buildEmbed(guild) {
        await guild.stickers.fetch();
        const stickers = guild.stickers.cache;
        if (stickers.size === 0) {
            return new EmbedBuilder()
                .setTitle(`${EMOJIS.info} Server Stickers`)
                .setColor(COLORS.info)
                .setDescription('This server has no custom stickers yet.');
        }
        const stickerList = stickers.map((s) => `**${s.name}** (\`${s.id}\`) — ${s.description || 'No description'} [${s.format}]`).join('\n');
        return new EmbedBuilder()
            .setTitle(`${EMOJIS.info} Server Stickers — ${guild.name}`)
            .setColor(COLORS.info)
            .setDescription(stickerList.slice(0, 4000))
            .addFields({ name: '🎨 Total Stickers', value: `${stickers.size}`, inline: true }, { name: '📦 Sticker Slots', value: `${guild.stickerSlotsAvailable || 'N/A'}`, inline: true })
            .setThumbnail(guild.iconURL({ size: 256 }))
            .setTimestamp();
    }
    async executeSlash(interaction) {
        await interaction.deferReply();
        const embed = await this.buildEmbed(interaction.guild);
        await interaction.editReply({ embeds: [embed] });
    }
    async executePrefix(message) {
        if (!message.guild)
            return;
        const embed = await this.buildEmbed(message.guild);
        await message.reply({ embeds: [embed] });
    }
}
export default StickersCommand;
