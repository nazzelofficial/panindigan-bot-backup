import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, Invite } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';
import { Formatter } from '../../utils/Formatter';

export class InviteInfoCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'inviteinfo',
      description: 'Display information about an invite',
      category: 'info',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['ii', 'invite'],
      examples: ['/inviteinfo https://discord.gg/code', 'p!inviteinfo code'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const inviteCode = interaction.options.getString('code') || '';
    if (!inviteCode) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide an invite code or URL.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    try {
      const invite = await interaction.client.fetchInvite(inviteCode);
      const embed = this.createInviteEmbed(invite);
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Invalid invite code or URL.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
    }
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const inviteCode = args[0] || '';
    if (!inviteCode) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide an invite code or URL.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    try {
      const invite = await message.client.fetchInvite(inviteCode);
      const embed = this.createInviteEmbed(invite);
      await message.reply({ embeds: [embed] });
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Invalid invite code or URL.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
    }
  }

  private createInviteEmbed(invite: Invite): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Invite Information`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Code', value: invite.code, inline: true },
        { name: 'Server', value: invite.guild?.name || 'Unknown', inline: true },
        { name: 'Inviter', value: invite.inviter?.username || 'Unknown', inline: true },
        { name: 'Uses', value: Formatter.formatNumber(invite.uses || 0), inline: true },
        { name: 'Max Uses', value: invite.maxUses ? Formatter.formatNumber(invite.maxUses) : 'Unlimited', inline: true },
        { name: 'Expires', value: invite.expiresAt ? Formatter.formatDate(invite.expiresAt) : 'Never', inline: true },
      ])
      .setTimestamp();
  }
}

export default InviteInfoCommand;
