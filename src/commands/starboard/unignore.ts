import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { getPrismaClient } from '../../database/postgresql/client';

export class StarboardUnignoreCommand extends BaseCommand {
  constructor() {
    super({ name: 'starboard-unignore', description: 'Remove a channel from the starboard ignore list', category: 'starboard', premiumTier: 'free', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, userPermissions: [PermissionFlagsBits.ManageGuild], aliases: ['sb-unignore', 'sbunignore'], examples: ['/starboard-unignore #channel'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description).addChannelOption(o => o.setName('channel').setDescription('Channel to unignore').setRequired(false)).setDMPermission(false)) as SlashCommandBuilder;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const channel = i.options.getChannel('channel') || i.channel!;
    const prisma = getPrismaClient();
    const guild = await prisma.guild.findUnique({ where: { guildId: i.guildId! } });
    let ignored: string[] = (guild as any)?.starboardIgnoredChannels ? JSON.parse((guild as any).starboardIgnoredChannels) : [];
    ignored = ignored.filter((id: string) => id !== channel.id);
    await prisma.guild.upsert({ where: { guildId: i.guildId! }, create: { guildId: i.guildId! }, update: { starboardIgnoredChannels: JSON.stringify(ignored) } as any });
    await i.reply({ content: `✅ <#${channel.id}> is no longer ignored by the starboard.`, ephemeral: true });
  }

  public async executePrefix(m: Message): Promise<void> {
    const channel = m.mentions.channels.first() || m.channel;
    const prisma = getPrismaClient();
    const guild = await prisma.guild.findUnique({ where: { guildId: m.guildId! } });
    let ignored: string[] = (guild as any)?.starboardIgnoredChannels ? JSON.parse((guild as any).starboardIgnoredChannels) : [];
    ignored = ignored.filter((id: string) => id !== channel.id);
    await prisma.guild.upsert({ where: { guildId: m.guildId! }, create: { guildId: m.guildId! }, update: { starboardIgnoredChannels: JSON.stringify(ignored) } as any });
    await m.reply(`✅ <#${channel.id}> removed from starboard ignore list.`);
  }
}
export default StarboardUnignoreCommand;
