// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class ApplicationCloseCommand extends BaseCommand {
    constructor() {
        super({ name: 'application-close', description: 'Close an application to stop submissions', category: 'applications', premiumTier: 'free', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, userPermissions: [PermissionFlagsBits.ManageGuild], aliases: ['app-close', 'appclose'], examples: ['/application-close <id>'] });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder().setName(this.name).setDescription(this.description).addStringOption(o => o.setName('id').setDescription('Application ID').setRequired(true)).setDMPermission(false));
    }
    async close(guildId, id) {
        const prisma = getPrismaClient();
        const app = await prisma.application.findFirst({ where: { id, guildId } });
        if (!app)
            return '❌ Application not found.';
        await prisma.application.update({ where: { id }, data: { open: false } });
        return `✅ Application **${app.name}** is now closed.`;
    }
    async executeSlash(i) {
        const id = i.options.getString('id', true);
        await i.reply({ content: await this.close(i.guildId, id), ephemeral: true });
    }
    async executePrefix(m, _args) {
        if (!args[0]) {
            await m.reply('❌ Usage: `p!application-close <id>`');
            return;
        }
        await m.reply(await this.close(m.guildId, args[0]));
    }
}
export default ApplicationCloseCommand;
