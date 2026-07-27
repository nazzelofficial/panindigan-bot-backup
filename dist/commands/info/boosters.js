// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class BoostersCommand extends BaseCommand {
    constructor() {
        super({
            name: 'boosters',
            description: 'List all current Nitro boosters of this server',
            category: 'info',
            premiumTier: 'silver',
            cooldown: 5,
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['serverboosts', 'boostlist'],
            examples: ['/boosters', 'p!boosters'],
        });
    }
    async executeSlash(interaction) {
        await interaction.deferReply();
        await this.send(interaction.guild, (e) => interaction.editReply({ embeds: [e] }));
    }
    async executePrefix(message) {
        if (!message.guild)
            return;
        const msg = await message.reply(`${EMOJIS.loading} Fetching boosters...`);
        await this.send(message.guild, (e) => msg.edit({ content: null, embeds: [e] }));
    }
    async send(guild, reply) {
        await guild.members.fetch();
        const boosters = guild.members.cache.filter((m) => m.premiumSince);
        if (boosters.size === 0) {
            return reply(new EmbedBuilder()
                .setTitle('💜 Server Boosters')
                .setColor(COLORS.info)
                .setDescription('This server has no Nitro boosters yet.\nBe the first to boost!'));
        }
        const sorted = [...boosters.values()].sort((a, b) => new Date(a.premiumSince).getTime() - new Date(b.premiumSince).getTime());
        const list = sorted.map((m, i) => {
            const since = Math.floor(new Date(m.premiumSince).getTime() / 1000);
            return `**${i + 1}.** ${m.user.tag} — since <t:${since}:d>`;
        }).join('\n');
        const chunks = list.match(/[\s\S]{1,4000}/g) || [list];
        const embed = new EmbedBuilder()
            .setTitle(`💜 Server Boosters — ${guild.name}`)
            .setColor(0xff73fa)
            .setDescription(chunks[0])
            .addFields({ name: '🚀 Total Boosters', value: `${boosters.size}`, inline: true }, { name: '✨ Boost Level', value: `Level ${guild.premiumTier}`, inline: true }, { name: '💎 Boost Count', value: `${guild.premiumSubscriptionCount || 0}`, inline: true })
            .setThumbnail(guild.iconURL({ size: 256 }))
            .setTimestamp();
        await reply(embed);
    }
}
export default BoostersCommand;
