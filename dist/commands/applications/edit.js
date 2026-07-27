// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { getPrismaClient } from '../../database/postgresql/client.js';
export class ApplicationEditCommand extends BaseCommand {
    constructor() {
        super({ name: 'application-edit', description: 'Edit an existing application configuration', category: 'applications', premiumTier: 'free', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, userPermissions: [PermissionFlagsBits.ManageGuild], aliases: ['app-edit', 'appedit'], examples: ['/application-edit <id>'] });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
            .addStringOption(o => o.setName('id').setDescription('Application ID').setRequired(true))
            .addStringOption(o => o.setName('name').setDescription('New name').setRequired(false))
            .addStringOption(o => o.setName('description').setDescription('New description').setRequired(false))
            .addRoleOption(o => o.setName('role').setDescription('Role given on acceptance').setRequired(false))
            .addChannelOption(o => o.setName('review_channel').setDescription('Channel for reviewing apps').setRequired(false))
            .setDMPermission(false));
    }
    async executeSlash(i) {
        const id = i.options.getString('id', true);
        const prisma = getPrismaClient();
        const app = await prisma.application.findFirst({ where: { id, guildId: i.guildId } });
        if (!app) {
            await i.reply({ content: '❌ Application not found.', ephemeral: true });
            return;
        }
        const updates = {};
        const name = i.options.getString('name');
        if (name)
            updates.name = name;
        const desc = i.options.getString('description');
        if (desc)
            updates.description = desc;
        const role = i.options.getRole('role');
        if (role)
            updates.acceptRoleId = role.id;
        const channel = i.options.getChannel('review_channel');
        if (channel)
            updates.reviewChannelId = channel.id;
        if (!Object.keys(updates).length) {
            await i.reply({ content: '⚠️ No changes provided.', ephemeral: true });
            return;
        }
        await prisma.application.update({ where: { id }, data: updates });
        await i.reply({ content: `✅ Application **${app.name}** updated.`, ephemeral: true });
    }
    async executePrefix(m, _args) {
        if (args.length < 3) {
            await m.reply('❌ Usage: `p!application-edit <id> <field> <value>`\nFields: name, description');
            return;
        }
        const [id, field, ...rest] = _args;
        const prisma = getPrismaClient();
        const app = await prisma.application.findFirst({ where: { id, guildId: m.guildId } });
        if (!app) {
            await m.reply('❌ Application not found.');
            return;
        }
        const updates = {};
        if (field === 'name')
            updates.name = rest.join(' ');
        else if (field === 'description')
            updates.description = rest.join(' ');
        else {
            await m.reply('❌ Valid fields: name, description');
            return;
        }
        await prisma.application.update({ where: { id }, data: updates });
        await m.reply(`✅ Application updated!`);
    }
}
export default ApplicationEditCommand;
