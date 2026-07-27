// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { getPrismaClient } from '../../database/postgresql/client.js';

export class StarboardIgnoreCommand extends BaseCommand {
  constructor() {
    super({ name: 'starboard-ignore', description: 'Ignore a channel from being added to starboard', category: 'starboard', premiumTier: 'free', cooldown: 5, guildOnly: true, slashCommand: true, prefixCommand: true, userPermissions: [PermissionFlagsBits.ManageGuild], aliases: ['sb-ignore', 'sbignore'], examples: ['/starboard-ignore #channel', 'p!starboard-ignore #channel'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addChannelOption(o => o.setName('channel').setDescription('Channel to ignore').setRequired(false))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const channel = i.options.getChannel('channel') || i.channel!;
    const prisma = getPrismaClient();
    const guild = await prisma.guild.findUnique({ where: { guildId: i.guildId! } });
    const ignored: string[] = (guild as any)?.starboardIgnoredChannels ? JSON.parse((guild as any).starboardIgnoredChannels) : [];

    if (ignored.includes(channel.id)) { await i.reply({ content: `⚠️ <#${channel.id}> is already ignored.`, ephemeral: true }); return; }
    ignored.push(channel.id);
    await prisma.guild.upsert({ where: { guildId: i.guildId! }, create: { guildId: i.guildId!, starboardIgnoredChannels: JSON.stringify(ignored) } as any, update: { starboardIgnoredChannels: JSON.stringify(ignored) } as any });
    await i.reply({ content: `✅ <#${channel.id}> will now be ignored by the starboard.`, ephemeral: true });
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    const channel = m.mentions.channels.first() || m.channel;
    const prisma = getPrismaClient();
    const guild = await prisma.guild.findUnique({ where: { guildId: m.guildId! } });
    const ignored: string[] = (guild as any)?.starboardIgnoredChannels ? JSON.parse((guild as any).starboardIgnoredChannels) : [];
    if (ignored.includes(channel.id)) { await m.reply(`⚠️ <#${channel.id}> is already ignored.`); return; }
    ignored.push(channel.id);
    await prisma.guild.upsert({ where: { guildId: m.guildId! }, create: { guildId: m.guildId!, starboardIgnoredChannels: JSON.stringify(ignored) } as any, update: { starboardIgnoredChannels: JSON.stringify(ignored) } as any });
    await m.reply(`✅ <#${channel.id}> will be ignored by the starboard.`);
  }
}
export default StarboardIgnoreCommand;
