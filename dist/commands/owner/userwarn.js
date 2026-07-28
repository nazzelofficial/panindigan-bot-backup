// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
import { getMongoDb as getMongoClient } from '../../database/mongodb/client.js';
export class UserWarnCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'userwarn',
            description: 'Issue a global bot warning to a user (Owner only)',
            category: 'owner',
            premiumTier: 'free',
            cooldown: 0,
            userPermissions: [],
            botPermissions: [],
            ownerOnly: true,
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['globalwarn'],
            examples: ['/userwarn 123456789 Abusing commands', 'p!userwarn 123456789 Abusing commands'],
        };
        super(options);
    }
    buildSlashCommand() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(o => o.setName('user_id').setDescription('User ID').setRequired(true))
            .addStringOption(o => o.setName('reason').setDescription('Warning reason').setRequired(true));
    }
    async issueWarn(userId, reason, issuedBy) {
        const mongo = await getMongoClient();
        const db = mongo.db();
        const collection = db.collection('global_warnings');
        await collection.insertOne({
            userId,
            reason,
            issuedBy,
            issuedAt: new Date(),
            active: true,
        });
        const count = await collection.countDocuments({ userId, active: true });
        return count;
    }
    async executeSlash(interaction) {
        const userId = interaction.options.getString('user_id', true);
        const reason = interaction.options.getString('reason', true);
        await interaction.deferReply({ ephemeral: true });
        try {
            const warnCount = await this.issueWarn(userId, reason, interaction.user.id);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.warning} Global Warning Issued`)
                .setColor(COLORS.warning)
                .addFields({ name: 'User ID', value: userId, inline: true }, { name: 'Total Warnings', value: String(warnCount), inline: true }, { name: 'Issued By', value: `<@${interaction.user.id}>`, inline: true }, { name: 'Reason', value: reason, inline: false })
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        }
        catch (error) {
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.error} Error`)
                .setColor(COLORS.error)
                .setDescription(`Failed to issue warning: ${error?.message ?? 'Unknown error'}`)
                .setTimestamp();
            await interaction.editReply({ embeds: [embed] });
        }
    }
    async executePrefix(message, _args) {
        const [userId, ...reasonParts] = _args;
        const reason = reasonParts.join(' ');
        if (!userId || !reason) {
            await message.reply(`${EMOJIS.error} Usage: \`p!userwarn <user_id> <reason>\``);
            return;
        }
        try {
            const warnCount = await this.issueWarn(userId, reason, message.author.id);
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.warning} Global Warning Issued`)
                .setColor(COLORS.warning)
                .addFields({ name: 'User ID', value: userId, inline: true }, { name: 'Total Warnings', value: String(warnCount), inline: true }, { name: 'Issued By', value: `<@${message.author.id}>`, inline: true }, { name: 'Reason', value: reason, inline: false })
                .setTimestamp();
            await message.reply({ embeds: [embed] });
        }
        catch (error) {
            const embed = new EmbedBuilder()
                .setTitle(`${EMOJIS.error} Error`)
                .setColor(COLORS.error)
                .setDescription(`Failed to issue warning: ${error?.message ?? 'Unknown error'}`)
                .setTimestamp();
            await message.reply({ embeds: [embed] });
        }
    }
}
export default UserWarnCommand;
