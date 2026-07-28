// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class SetBotRoleCommand extends BaseCommand {
  constructor() {
    super({ name: 'setbotrole', description: 'Auto-assign a role to new bots when they join 🤖', category: 'admin', premiumTier: 'bronze', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, userPermissions: [PermissionFlagsBits.ManageGuild, PermissionFlagsBits.ManageRoles], botPermissions: [PermissionFlagsBits.ManageRoles], aliases: ['botautorole', 'botrolerole'], examples: ['/setbotrole @Bots', 'p!setbotrole @Bots'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addRoleOption(o => o.setName('role').setDescription('Role to assign to new bots (leave empty to disable)').setRequired(false))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  private async handle(guildId: string, roleId: string | null, send: (c: any) => Promise<any>): Promise<void> {
    const prisma = getPrismaClient();

    await prisma.guild.upsert({
      where: { guildId },
      create: { guildId, botRoleId: roleId } as any,
      update: { botRoleId: roleId } as any,
    });

    const embed = new EmbedBuilder()
      .setTitle('🤖 Bot Auto-Role Updated')
      .setColor(COLORS.success)
      .setDescription(roleId
        ? `New bots will automatically receive the ${roleId ? `<@&${roleId}>` : 'configured'} role when they join this server.`
        : '❌ Bot auto-role has been disabled.')
      .addFields({ name: 'Role', value: roleId ? `<@&${roleId}>` : 'Disabled', inline: true })
      .setTimestamp();

    await send({ embeds: [embed] });
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const role = i.options.getRole('role');
    await this.handle(i.guildId!, role?.id || null, (c) => i.reply(c));
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    const role = m.mentions.roles.first();
    if (!args.length) {
      await m.reply('❌ Usage: `p!setbotrole @role` or `p!setbotrole disable`');
      return;
    }
    if (args[0].toLowerCase() === 'disable') {
      await this.handle(m.guildId!, null, (c) => m.reply(c));
      return;
    }
    await this.handle(m.guildId!, role?.id || null, (c) => m.reply(c));
  }
}
export default SetBotRoleCommand;
