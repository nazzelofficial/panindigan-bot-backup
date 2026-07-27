// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
export class ConfessCommand extends BaseCommand {
    constructor() {
        super({
            name: 'confess',
            description: 'Send an anonymous love confession via DM 💌',
            category: 'social',
            premiumTier: 'free',
            cooldown: 30,
            guildOnly: false,
            slashCommand: true,
            prefixCommand: true,
            aliases: ['confession', 'admire'],
            examples: ['/confess @user You make my heart skip a beat every time I see you'],
        });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .addUserOption(o => o.setName('user').setDescription('Who to confess to (anonymously)').setRequired(true))
            .addStringOption(o => o.setName('message')
            .setDescription('Your secret confession message')
            .setRequired(true)
            .setMaxLength(500))
            .setDMPermission(true));
    }
    async executeSlash(i) {
        try {
            const target = i.options.getUser('user', true);
            const message = i.options.getString('message', true);
            if (target.id === i.user.id) {
                await i.reply({ content: '❌ You cannot confess to yourself!', ephemeral: true });
                return;
            }
            if (target.bot) {
                await i.reply({ content: '❌ Bots don\'t read DMs like that! 🤖💔', ephemeral: true });
                return;
            }
            const confessionEmbed = new EmbedBuilder()
                .setTitle('💌 Someone has a secret message for you...')
                .setDescription(`🌸 *An anonymous admirer has confessed something to you:*\n\n` +
                `> *"${message}"*\n\n` +
                `💖 *This confession was sent anonymously. Someone out there truly admires you!*`)
                .setColor(COLORS.default)
                .setFooter({ text: 'A secret admirer sent this via Panindigan 🌹' })
                .setTimestamp();
            try {
                await target.send({ embeds: [confessionEmbed] });
            }
            catch {
                await i.reply({ content: '❌ I couldn\'t DM that user. They may have DMs disabled.', ephemeral: true });
                return;
            }
            const confirmEmbed = new EmbedBuilder()
                .setTitle('💌 Confession Sent!')
                .setDescription(`Your anonymous confession has been delivered to **${target.username}** 🌹\n\n*They'll never know it was you... 🤫*`)
                .setColor(COLORS.default)
                .setFooter({ text: 'Courage is beautiful 💕' })
                .setTimestamp();
            await i.reply({ embeds: [confirmEmbed], ephemeral: true });
        }
        catch (err) {
            console.error('[ConfessCommand] Error:', err);
            await i.reply({ content: '❌ Could not send the confession. Please try again.', ephemeral: true });
        }
    }
    async executePrefix(m, _args) {
        try {
            const target = m.mentions.users.first();
            if (!target) {
                await m.reply('❌ Please mention a user! Example: `confess @user You make my heart skip a beat!`');
                return;
            }
            if (target.id === m.author.id) {
                await m.reply('❌ You cannot confess to yourself!');
                return;
            }
            if (target.bot) {
                await m.reply('❌ Bots don\'t read DMs like that! 🤖💔');
                return;
            }
            const message = _args.slice(1).join(' ');
            if (!message) {
                await m.reply('❌ Please include a confession message! Example: `confess @user You make my heart skip a beat!`');
                return;
            }
            if (message.length > 500) {
                await m.reply('❌ Your confession is too long! Keep it under 500 characters.');
                return;
            }
            const confessionEmbed = new EmbedBuilder()
                .setTitle('💌 Someone has a secret message for you...')
                .setDescription(`🌸 *An anonymous admirer has confessed something to you:*\n\n` +
                `> *"${message}"*\n\n` +
                `💖 *This confession was sent anonymously. Someone out there truly admires you!*`)
                .setColor(COLORS.default)
                .setFooter({ text: 'A secret admirer sent this via Panindigan 🌹' })
                .setTimestamp();
            try {
                await target.send({ embeds: [confessionEmbed] });
            }
            catch {
                await m.reply('❌ I couldn\'t DM that user. They may have DMs disabled.');
                return;
            }
            try {
                await m.delete();
            }
            catch {
                // Message deletion may fail due to permissions — that's fine
            }
            const confirmEmbed = new EmbedBuilder()
                .setTitle('💌 Confession Sent!')
                .setDescription(`Your anonymous confession has been delivered! 🌹\n\n*They'll never know it was you... 🤫*`)
                .setColor(COLORS.default)
                .setFooter({ text: 'Courage is beautiful 💕' })
                .setTimestamp();
            try {
                await m.author.send({ embeds: [confirmEmbed] });
            }
            catch {
                // DM to sender may fail — silently ignore
            }
        }
        catch (err) {
            console.error('[ConfessCommand] Error:', err);
            await m.reply('❌ Could not send the confession. Please try again.');
        }
    }
}
export default ConfessCommand;
