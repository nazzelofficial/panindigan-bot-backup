// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class ShardBroadcastCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'shardbroadcast',
            description: 'Broadcast a message to all shards (Owner only)',
            category: 'owner',
            premiumTier: 'free',
            cooldown: 0,
            userPermissions: [],
            botPermissions: [],
            ownerOnly: true,
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['broadcast', 'sbroadcast'],
            examples: ['/shardbroadcast Hello all shards!', 'p!shardbroadcast Hello all shards!'],
        };
        super(options);
    }
    async executeSlash(interaction) {
        const broadcastMessage = interaction.options.getString('message', true);
        await interaction.deferReply({ ephemeral: true });
        const shardCount = interaction.client.shard?.count ?? 1;
        try {
            if (interaction.client.shard) {
                await interaction.client.shard.broadcastEval((c, { msg }) => {
                    console.log(`[Shard Broadcast] ${msg}`);
                }, { context: { msg: broadcastMessage } });
            }
            const embed = new EmbedBuilder()
                .setColor(COLORS.success)
                .setTitle(`${EMOJIS.success} Broadcast Sent`)
                .setDescription(`Your message has been broadcast to all shards.`)
                .addFields({ name: '📢 Message', value: broadcastMessage.slice(0, 1024), inline: false }, { name: '🔀 Shards Reached', value: `\`${shardCount}\``, inline: true })
                .setFooter({ text: `Requested by ${interaction.user.tag}` })
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        }
        catch (err) {
            const embed = new EmbedBuilder()
                .setColor(COLORS.error)
                .setTitle(`${EMOJIS.error} Broadcast Failed`)
                .setDescription(`\`\`\`${err?.message || 'Unknown error'}\`\`\``)
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        }
    }
    async executePrefix(message, _args) {
        const broadcastMessage = _args.join(' ');
        if (!broadcastMessage) {
            await message.reply(`${EMOJIS.error} Please provide a message to broadcast.`);
            return;
        }
        const shardCount = message.client.shard?.count ?? 1;
        try {
            if (message.client.shard) {
                await message.client.shard.broadcastEval((c, { msg }) => {
                    console.log(`[Shard Broadcast] ${msg}`);
                }, { context: { msg: broadcastMessage } });
            }
            const embed = new EmbedBuilder()
                .setColor(COLORS.success)
                .setTitle(`${EMOJIS.success} Broadcast Sent`)
                .setDescription(`Your message has been broadcast to all shards.`)
                .addFields({ name: '📢 Message', value: broadcastMessage.slice(0, 1024), inline: false }, { name: '🔀 Shards Reached', value: `\`${shardCount}\``, inline: true })
                .setFooter({ text: `Requested by ${message.author.tag}` })
                .setTimestamp();
            await message.reply({ embeds: [embed] });
        }
        catch (err) {
            const embed = new EmbedBuilder()
                .setColor(COLORS.error)
                .setTitle(`${EMOJIS.error} Broadcast Failed`)
                .setDescription(`\`\`\`${err?.message || 'Unknown error'}\`\`\``)
                .setTimestamp();
            await message.reply({ embeds: [embed] });
        }
    }
}
export default ShardBroadcastCommand;
