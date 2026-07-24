import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { getPrismaClient } from '../../database/postgresql/client';

export class ApplicationAutoCommand extends BaseCommand {
  constructor() {
    super({ name: 'application-auto', description: 'Configure auto-accept/auto-deny rules for an application', category: 'applications', premiumTier: 'free', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, userPermissions: [PermissionFlagsBits.ManageGuild], aliases: ['app-auto', 'appauto'], examples: ['/application-auto <id>'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addStringOption(o => o.setName('id').setDescription('Application ID').setRequired(true))
      .addStringOption(o => o.setName('mode').setDescription('Auto mode').setRequired(true).addChoices({ name: 'Auto Accept', value: 'accept' }, { name: 'Auto Deny', value: 'deny' }, { name: 'Manual Review', value: 'manual' }))
      .addIntegerOption(o => o.setName('min_level').setDescription('Minimum level to auto-accept').setRequired(false))
      .addIntegerOption(o => o.setName('min_account_age').setDescription('Minimum account age in days').setRequired(false))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const id = i.options.getString('id', true);
    const mode = i.options.getString('mode', true);
    const minLevel = i.options.getInteger('min_level');
    const minAge = i.options.getInteger('min_account_age');

    const prisma = getPrismaClient();
    const app = await prisma.application.findFirst({ where: { id, guildId: i.guildId! } });
    if (!app) { await i.reply({ content: '❌ Application not found.', ephemeral: true }); return; }

    await prisma.application.update({
      where: { id },
      data: { autoMode: mode, minLevel: minLevel || null, minAccountAge: minAge || null } as any,
    });

    let msg = `✅ Application **${app.name}** set to **${mode}** mode.`;
    if (minLevel) msg += ` Min level: ${minLevel}.`;
    if (minAge) msg += ` Min account age: ${minAge} days.`;
    await i.reply({ content: msg, ephemeral: true });
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    if (args.length < 2) { await m.reply('❌ Usage: `p!application-auto <id> accept|deny|manual`'); return; }
    const [id, mode] = args;
    const prisma = getPrismaClient();
    const app = await prisma.application.findFirst({ where: { id, guildId: m.guildId! } });
    if (!app) { await m.reply('❌ Application not found.'); return; }
    await prisma.application.update({ where: { id }, data: { autoMode: mode } as any });
    await m.reply(`✅ Application set to **${mode}** mode.`);
  }
}
export default ApplicationAutoCommand;
