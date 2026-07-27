// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class ApplicationReviewerCommand extends BaseCommand {
    constructor() {
        super({ name: 'application-reviewer', description: 'Set the reviewer role for an application', category: 'applications', premiumTier: 'free', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, userPermissions: [PermissionFlagsBits.ManageGuild], aliases: ['app-reviewer', 'appreviewer'], examples: ['/application-reviewer <id> @Role'] });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
            .addStringOption(o => o.setName('id').setDescription('Application ID').setRequired(true))
            .addRoleOption(o => o.setName('role').setDescription('Reviewer role').setRequired(true))
            .setDMPermission(false));
    }
    async executeSlash(i) {
        const id = i.options.getString('id', true);
        const role = i.options.getRole('role', true);
        const prisma = getPrismaClient();
        const app = await prisma.application.findFirst({ where: { id, guildId: i.guildId } });
        if (!app) {
            await i.reply({ content: '❌ Application not found.', ephemeral: true });
            return;
        }
        await prisma.application.update({ where: { id }, data: { reviewerRoleId: role.id } });
        await i.reply({ content: `✅ **${app.name}** reviewers set to <@&${role.id}>.`, ephemeral: true });
    }
    async executePrefix(m, _args) {
        if (args.length < 2) {
            await m.reply('❌ Usage: `p!application-reviewer <id> @role`');
            return;
        }
        const [id] = _args;
        const role = m.mentions.roles.first();
        if (!role) {
            await m.reply('❌ Mention a role.');
            return;
        }
        const prisma = getPrismaClient();
        const app = await prisma.application.findFirst({ where: { id, guildId: m.guildId } });
        if (!app) {
            await m.reply('❌ Application not found.');
            return;
        }
        await prisma.application.update({ where: { id }, data: { reviewerRoleId: role.id } });
        await m.reply(`✅ Reviewer role set to <@&${role.id}>.`);
    }
}
export default ApplicationReviewerCommand;
