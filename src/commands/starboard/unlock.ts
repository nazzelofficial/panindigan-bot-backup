// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, PermissionFlagsBits } from 'discord.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class StarboardUnlockCommand extends BaseCommand {
  constructor() {
    super({ name: 'starboard-unlock', description: 'Unlock the starboard to allow new entries', category: 'starboard', premiumTier: 'free', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, userPermissions: [PermissionFlagsBits.ManageGuild], aliases: ['sb-unlock', 'sbunlock'], examples: ['/starboard-unlock'] } as CommandOptions);
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const prisma = getPrismaClient();
    await prisma.guild.upsert({ where: { guildId: i.guildId! }, create: { guildId: i.guildId!, starboardLocked: false }, update: { starboardLocked: false } });
    await i.reply({ content: '🔓 Starboard unlocked! New entries will be accepted.', ephemeral: true });
  }

  public async executePrefix(m: Message): Promise<void> {
    const prisma = getPrismaClient();
    await prisma.guild.upsert({ where: { guildId: m.guildId! }, create: { guildId: m.guildId!, starboardLocked: false }, update: { starboardLocked: false } });
    await m.reply('🔓 Starboard unlocked!');
  }
}
export default StarboardUnlockCommand;
