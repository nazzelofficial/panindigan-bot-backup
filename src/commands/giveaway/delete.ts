// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class GiveawayDeleteCommand extends BaseCommand {
  constructor() {
    super({ name: 'gdelete', description: 'Delete a giveaway completely', category: 'giveaway', premiumTier: 'free', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, userPermissions: [PermissionFlagsBits.ManageGuild], aliases: ['giveaway-delete', 'gw-delete'], examples: ['/gdelete <id>', 'p!gdelete <id>'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addStringOption(o => o.setName('id').setDescription('Giveaway ID to delete').setRequired(true))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  private async doDelete(guildId: string, id: string): Promise<string> {
    const prisma = getPrismaClient();
    const giveaway = await prisma.giveaway.findFirst({ where: { id, guildId } });
    if (!giveaway) return '❌ Giveaway not found.';
    await prisma.giveawayEntry.deleteMany({ where: { giveawayId: id } });
    await prisma.giveaway.delete({ where: { id } });
    return `✅ Giveaway **${giveaway.prize}** deleted successfully.`;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const id = i.options.getString('id', true);
    await i.reply({ content: await this.doDelete(i.guildId!, id), ephemeral: true });
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    if (!args[0]) { await m.reply('❌ Usage: `p!gdelete <id>`'); return; }
    await m.reply(await this.doDelete(m.guildId!, args[0]));
  }
}
export default GiveawayDeleteCommand;
