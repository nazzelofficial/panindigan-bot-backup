import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class InviteLeaderboardCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'inviteleaderboard',
      description: 'Show the server invite leaderboard',
      category: 'info',
      cooldown: 10,
      userPermissions: [],
      botPermissions: ['ManageGuild'],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['invites', 'inviteboard'],
      examples: ['/inviteleaderboard', 'p!inviteleaderboard'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .setDMPermission(false) as SlashCommandBuilder;
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();
    try {
      const guild = interaction.guild!;
      const invites = await guild.invites.fetch();

      // Group by inviter
      const inviterMap = new Map<string, { uses: number; inviter: string }>();
      for (const invite of invites.values()) {
        if (!invite.inviter || !invite.uses) continue;
        const existing = inviterMap.get(invite.inviter.id);
        if (existing) {
          existing.uses += invite.uses;
        } else {
          inviterMap.set(invite.inviter.id, { uses: invite.uses, inviter: invite.inviter.tag });
        }
      }

      const sorted = [...inviterMap.entries()].sort((a, b) => b[1].uses - a[1].uses).slice(0, 10);

      if (!sorted.length) {
        await interaction.editReply({ content: `${EMOJIS.info} No invite data found for this server.` });
        return;
      }

      const medals = ['🥇', '🥈', '🥉'];
      const embed = new EmbedBuilder()
        .setTitle(`📨 Invite Leaderboard — ${guild.name}`)
        .setColor(COLORS.info)
        .setDescription(sorted.map(([id, data], i) =>
          `${medals[i] || `**${i + 1}.**`} <@${id}> — **${data.uses}** invite${data.uses !== 1 ? 's' : ''}`
        ).join('\n'))
        .setFooter({ text: `Total invites tracked: ${invites.size}` })
        .setTimestamp();
      await interaction.editReply({ embeds: [embed] });
    } catch (err: any) {
      await interaction.editReply({ content: `${EMOJIS.error} ${err.message || 'Failed to fetch invites. Missing Manage Guild permission?'}` });
    }
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    try {
      const guild = message.guild!;
      const invites = await guild.invites.fetch();
      const inviterMap = new Map<string, number>();
      for (const invite of invites.values()) {
        if (!invite.inviter || !invite.uses) continue;
        inviterMap.set(invite.inviter.id, (inviterMap.get(invite.inviter.id) || 0) + invite.uses);
      }
      const sorted = [...inviterMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
      const embed = new EmbedBuilder()
        .setTitle(`📨 Invite Leaderboard — ${guild.name}`)
        .setColor(COLORS.info)
        .setDescription(sorted.length
          ? sorted.map(([id, uses], i) => `**${i + 1}.** <@${id}> — **${uses}** invites`).join('\n')
          : 'No invite data found.')
        .setTimestamp();
      await message.reply({ embeds: [embed] });
    } catch (err: any) {
      await message.reply(`${EMOJIS.error} ${err.message || 'Failed to fetch invites.'}`);
    }
  }
}

export default InviteLeaderboardCommand;
