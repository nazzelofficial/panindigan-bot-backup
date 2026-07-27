// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class ApplicationOpenCommand extends BaseCommand {
    constructor() {
        super({ name: 'application-open', description: 'Open an application for submissions', category: 'applications', premiumTier: 'free', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, userPermissions: [PermissionFlagsBits.ManageGuild], aliases: ['app-open', 'appopen'], examples: ['/application-open <id>', 'p!application-open <id>'] });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder().setName(this.name).setDescription(this.description).addStringOption(o => o.setName('id').setDescription('Application ID').setRequired(true)).setDMPermission(false));
    }
    async open(guildId, id) {
        const prisma = getPrismaClient();
        const app = await prisma.application.findFirst({ where: { id, guildId } });
        if (!app)
            return '❌ Application not found.';
        await prisma.application.update({ where: { id }, data: { open: true } });
        return `✅ Application **${app.name}** is now open for submissions.`;
    }
    async executeSlash(i) {
        const id = i.options.getString('id', true);
        await i.reply({ content: await this.open(i.guildId, id), ephemeral: true });
    }
    async executePrefix(m, _args) {
        if (!args[0]) {
            await m.reply('❌ Usage: `p!application-open <id>`');
            return;
        }
        await m.reply(await this.open(m.guildId, args[0]));
    }
}
export default ApplicationOpenCommand;
