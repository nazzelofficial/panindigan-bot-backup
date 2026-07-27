// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
export class NotifyCommand extends BaseCommand {
    constructor() {
        const options = {
            name: 'notify',
            description: 'Show notification plan for a user group (Owner only)',
            category: 'owner',
            premiumTier: 'free',
            cooldown: 0,
            userPermissions: [],
            botPermissions: [],
            ownerOnly: true,
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['sendnotify'],
            examples: ['/notify premium New features released!', 'p!notify all Server maintenance tonight'],
        };
        super(options);
    }
    buildSlashCommand() {
        return new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addStringOption(o => o.setName('type')
            .setDescription('Who to notify')
            .setRequired(true)
            .addChoices({ name: 'premium', value: 'premium' }, { name: 'all', value: 'all' }, { name: 'trial', value: 'trial' }))
            .addStringOption(o => o.setName('message').setDescription('Notification message').setRequired(true));
    }
    buildPlanEmbed(type, notifMessage, guildCount) {
        const typeLabels = {
            premium: `${EMOJIS.premium} Premium Users`,
            all: `${EMOJIS.info} All Users`,
            trial: `⏳ Trial Users`,
        };
        const typeColors = {
            premium: COLORS.gold,
            all: COLORS.default,
            trial: COLORS.warning,
        };
        const targetDesc = {
            premium: 'Users with an active premium subscription (bronze, silver, gold, diamond)',
            all: `All users across all ${guildCount} servers`,
            trial: 'Users currently in a trial period',
        };
        return new EmbedBuilder()
            .setTitle(`${EMOJIS.info} Notification Plan`)
            .setColor(typeColors[type] ?? COLORS.default)
            .addFields({ name: 'Target Group', value: typeLabels[type] ?? type, inline: true }, { name: 'Guild Count', value: String(guildCount), inline: true }, { name: 'Target Description', value: targetDesc[type] ?? 'Unknown group', inline: false }, { name: 'Message Preview', value: notifMessage.slice(0, 1024), inline: false })
            .setFooter({ text: 'This is a preview — no messages were sent.' })
            .setTimestamp();
    }
    async executeSlash(interaction) {
        const type = interaction.options.getString('type', true);
        const notifMessage = interaction.options.getString('message', true);
        const guildCount = interaction.client.guilds.cache.size;
        const embed = this.buildPlanEmbed(type, notifMessage, guildCount);
        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
    async executePrefix(message, _args) {
        const [type, ...messageParts] = _args;
        const notifMessage = messageParts.join(' ');
        if (!type || !notifMessage) {
            await message.reply(`${EMOJIS.error} Usage: \`p!notify <premium|all|trial> <message>\``);
            return;
        }
        if (!['premium', 'all', 'trial'].includes(type.toLowerCase())) {
            await message.reply(`${EMOJIS.error} Type must be one of: \`premium\`, \`all\`, \`trial\``);
            return;
        }
        const guildCount = message.client.guilds.cache.size;
        const embed = this.buildPlanEmbed(type.toLowerCase(), notifMessage, guildCount);
        await message.reply({ embeds: [embed] });
    }
}
export default NotifyCommand;
