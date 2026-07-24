import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class InviteInfoCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'inviteinfo',
      description: 'Display information about an invite',
      category: 'utility',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['invite'],
      examples: ['/inviteinfo https://discord.gg/code', 'p!inviteinfo https://discord.gg/code'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const inviteCode = interaction.options.getString('code');
    if (!inviteCode) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide an invite code or URL.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const code = this.extractInviteCode(inviteCode);

    try {
      const invite = await interaction.client.fetchInvite(code);
      
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.info} Invite Information`)
        .setColor(COLORS.info)
        .addFields([
          { name: 'Server', value: invite.guild?.name || 'Unknown', inline: true },
          { name: 'Code', value: code, inline: true },
          { name: 'Uses', value: invite.uses?.toString() || 'Unknown', inline: true },
          { name: 'Max Uses', value: invite.maxUses?.toString() || 'Unlimited', inline: true },
          { name: 'Temporary', value: invite.temporary ? 'Yes' : 'No', inline: true },
          { name: 'Expires', value: invite.expiresAt ? new Date(invite.expiresAt).toLocaleString() : 'Never', inline: true },
        ])
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Invalid invite code or the invite has expired.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
    }
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const inviteCode = args[0];

    if (!inviteCode) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide an invite code or URL.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const code = this.extractInviteCode(inviteCode);

    try {
      const invite = await message.client.fetchInvite(code);
      
      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.info} Invite Information`)
        .setColor(COLORS.info)
        .addFields([
          { name: 'Server', value: invite.guild?.name || 'Unknown', inline: true },
          { name: 'Code', value: code, inline: true },
          { name: 'Uses', value: invite.uses?.toString() || 'Unknown', inline: true },
          { name: 'Max Uses', value: invite.maxUses?.toString() || 'Unlimited', inline: true },
          { name: 'Temporary', value: invite.temporary ? 'Yes' : 'No', inline: true },
          { name: 'Expires', value: invite.expiresAt ? new Date(invite.expiresAt).toLocaleString() : 'Never', inline: true },
        ])
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Invalid invite code or the invite has expired.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
    }
  }

  private extractInviteCode(input: string): string {
    const patterns = [
      /discord\.gg\/([a-zA-Z0-9-]+)/,
      /discord\.com\/invite\/([a-zA-Z0-9-]+)/,
      /discordapp\.com\/invite\/([a-zA-Z0-9-]+)/,
    ];

    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match) return match[1];
    }

    return input;
  }
}

export default InviteInfoCommand;
