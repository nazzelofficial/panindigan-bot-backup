// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class BanListCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'banlist',
            description: 'View all bans in the server',
            category: 'moderation',
            cooldown: 10,
            userPermissions: [PermissionFlagsBits.BanMembers],
            botPermissions: [PermissionFlagsBits.BanMembers],
            guildOnly: true,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['bans', 'listbans'],
            examples: ['/banlist', 'p!banlist'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        await this.showBanList(interaction);
    }
    async executePrefix(message) {
        await this.showBanList(message);
    }
    async showBanList(interaction) {
        if (!interaction.guild)
            return;
        try {
            const bans = await interaction.guild.bans.fetch();
            if (bans.size === 0) {
                if (interaction instanceof ChatInputCommandInteraction) {
                    await interaction.reply({ content: '✅ No bans in this server.', ephemeral: true });
                }
                else {
                    await interaction.reply('✅ No bans in this server.');
                }
                return;
            }
            const banList = bans.map(ban => `${ban.user.tag} (${ban.user.id}) - ${ban.reason || 'No reason'}`).join('\n');
            const chunks = this.chunkString(banList, 1024);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.moderation} Server Ban List`)
                .setColor(COLORS.info)
                .addFields([
                { name: 'Total Bans', value: bans.size.toString(), inline: true },
                { name: 'Bans', value: chunks[0], inline: false },
            ])
                .setTimestamp();
            if (interaction instanceof ChatInputCommandInteraction) {
                await interaction.reply({ embeds: [embed] });
            }
            else {
                await interaction.reply({ embeds: [embed] });
            }
            for (let i = 1; i < chunks.length; i++) {
                const followUpEmbed = new EmbedBuilder()
                    .setColor(COLORS.info)
                    .addField('Bans (continued)', chunks[i]);
                if (interaction instanceof ChatInputCommandInteraction) {
                    await interaction.followUp({ embeds: [followUpEmbed] });
                }
                else {
                    await interaction.channel.send({ embeds: [followUpEmbed] });
                }
            }
        }
        catch (error) {
            if (interaction instanceof ChatInputCommandInteraction) {
                await interaction.reply({ content: '❌ Failed to fetch ban list.', ephemeral: true });
            }
            else {
                await interaction.reply('❌ Failed to fetch ban list.');
            }
        }
    }
    chunkString(str, length) {
        const chunks = [];
        let currentChunk = '';
        const lines = str.split('\n');
        for (const line of lines) {
            if (currentChunk.length + line.length + 1 > length) {
                chunks.push(currentChunk);
                currentChunk = line;
            }
            else {
                currentChunk += (currentChunk ? '\n' : '') + line;
            }
        }
        if (currentChunk) {
            chunks.push(currentChunk);
        }
        return chunks;
    }
}
export default BanListCommand;
