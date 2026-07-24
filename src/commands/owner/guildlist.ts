import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';
import { PanindiganClient } from '../../structures/PanindiganClient';

export class GuildListCommand extends BaseCommand {
  constructor() {
    super({ name: 'guildlist', description: 'List all guilds the bot is in (Owner only)', category: 'owner', premiumTier: 'free', cooldown: 5, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['serverlist', 'guilds', 'servers'], examples: ['p!guildlist', 'p!guildlist 2'] } as CommandOptions);
  }
  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addIntegerOption(o => o.setName('page').setDescription('Page number').setRequired(false))) as SlashCommandBuilder;
  }
  private buildEmbed(client: PanindiganClient, page: number): EmbedBuilder {
    const perPage = 15;
    const guilds = [...client.guilds.cache.values()];
    const start = (page - 1) * perPage;
    const pageGuilds = guilds.slice(start, start + perPage);
    const pages = Math.ceil(guilds.length / perPage);
    return new EmbedBuilder().setTitle(`📋 Guild List (${guilds.length} total)`)
      .setColor(COLORS.info)
      .setDescription(pageGuilds.map(g => `**${g.name}** (\`${g.id}\`) — ${g.memberCount} members`).join('\n'))
      .setFooter({ text: `Page ${page}/${pages}` }).setTimestamp();
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const page = i.options.getInteger('page') || 1;
    await i.reply({ embeds: [this.buildEmbed(i.client as PanindiganClient, page)], ephemeral: true });
  }
  public async executePrefix(m: Message, args: string[]): Promise<void> {
    const page = parseInt(args[0]) || 1;
    await m.reply({ embeds: [this.buildEmbed(m.client as PanindiganClient, page)] });
  }
}
export default GuildListCommand;
