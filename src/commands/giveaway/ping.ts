import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { getPrismaClient } from '../../database/postgresql/client';

export class GiveawayPingCommand extends BaseCommand {
  constructor() {
    super({ name: 'gping', description: 'Set a role to ping when a new giveaway starts', category: 'giveaway', premiumTier: 'free', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, userPermissions: [PermissionFlagsBits.ManageGuild], aliases: ['giveaway-ping', 'gw-ping'], examples: ['/gping @Giveaways', 'p!gping @Giveaways'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addRoleOption(o => o.setName('role').setDescription('Role to ping on new giveaways (leave empty to disable)').setRequired(false))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const role = i.options.getRole('role');
    const prisma = getPrismaClient();
    await prisma.guild.upsert({ where: { guildId: i.guildId! }, create: { guildId: i.guildId! }, update: { giveawayPingRoleId: role?.id || null } as any });
    if (role) await i.reply({ content: `✅ <@&${role.id}> will be pinged when new giveaways start.`, ephemeral: true });
    else await i.reply({ content: '✅ Giveaway ping role disabled.', ephemeral: true });
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    const role = m.mentions.roles.first();
    const prisma = getPrismaClient();
    await prisma.guild.upsert({ where: { guildId: m.guildId! }, create: { guildId: m.guildId! }, update: { giveawayPingRoleId: role?.id || null } as any });
    if (role) await m.reply(`✅ <@&${role.id}> will be pinged for new giveaways.`);
    else await m.reply('✅ Giveaway ping disabled.');
  }
}
export default GiveawayPingCommand;
