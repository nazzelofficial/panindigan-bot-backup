// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class ApplicationNotifyCommand extends BaseCommand {
    constructor() {
        super({ name: 'application-notify', description: 'Configure DM notifications for applicants', category: 'applications', premiumTier: 'free', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, userPermissions: [PermissionFlagsBits.ManageGuild], aliases: ['app-notify', 'appnotify'], examples: ['/application-notify <id> on'] });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
            .addStringOption(o => o.setName('id').setDescription('Application ID').setRequired(true))
            .addBooleanOption(o => o.setName('enabled').setDescription('Enable DM notifications').setRequired(true))
            .addStringOption(o => o.setName('accept_message').setDescription('Custom accept message').setRequired(false))
            .addStringOption(o => o.setName('deny_message').setDescription('Custom deny message').setRequired(false))
            .setDMPermission(false));
    }
    async executeSlash(i) {
        const id = i.options.getString('id', true);
        const enabled = i.options.getBoolean('enabled', true);
        const acceptMsg = i.options.getString('accept_message');
        const denyMsg = i.options.getString('deny_message');
        const prisma = getPrismaClient();
        const app = await prisma.application.findFirst({ where: { id, guildId: i.guildId } });
        if (!app) {
            await i.reply({ content: '❌ Application not found.', ephemeral: true });
            return;
        }
        await prisma.application.update({ where: { id }, data: { dmNotify: enabled, acceptMessage: acceptMsg || undefined, denyMessage: denyMsg || undefined } });
        await i.reply({ content: `✅ DM notifications ${enabled ? 'enabled' : 'disabled'} for **${app.name}**.`, ephemeral: true });
    }
    async executePrefix(m, _args) {
        if (args.length < 2) {
            await m.reply('❌ Usage: `p!application-notify <id> on/off`');
            return;
        }
        const [id, toggle] = _args;
        const enabled = toggle === 'on' || toggle === 'true';
        const prisma = getPrismaClient();
        const app = await prisma.application.findFirst({ where: { id, guildId: m.guildId } });
        if (!app) {
            await m.reply('❌ Application not found.');
            return;
        }
        await prisma.application.update({ where: { id }, data: { dmNotify: enabled } });
        await m.reply(`✅ DM notifications ${enabled ? 'enabled' : 'disabled'}.`);
    }
}
export default ApplicationNotifyCommand;
