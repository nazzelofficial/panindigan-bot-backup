// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';

export class GlobalAnnounceCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'globalannounce',
      description: 'Send an announcement to ALL servers (Owner only)',
      category: 'owner',
      premiumTier: 'free',
      cooldown: 0,
      userPermissions: [],
      botPermissions: [],
      ownerOnly: true,
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['gannounce', 'globalann'],
      examples: ['/globalannounce Bot maintenance in 10 min --confirm', 'p!globalannounce Bot maintenance in 10 min --confirm'],
    };
    super(options);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption(o => o.setName('message').setDescription('Announcement message (add --confirm to execute)').setRequired(true)) as SlashCommandBuilder;
  }

  private async sendToAllGuilds(client: any, announcementText: string): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const guild of client.guilds.cache.values()) {
      try {
        const systemChannel = guild.systemChannel;
        if (systemChannel && systemChannel.permissionsFor(guild.members.me!)?.has('SendMessages')) {
          const embed = new EmbedBuilder()
            .setTitle(`${EMOJIS.info} Global Announcement`)
            .setColor(COLORS.default)
            .setDescription(announcementText)
            .setTimestamp();
          await systemChannel.send({ embeds: [embed] });
          sent++;
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
    }
    return { sent, failed };
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const rawMessage = interaction.options.getString('message', true);
    const confirmed = rawMessage.includes('--confirm');
    const announcementText = rawMessage.replace('--confirm', '').trim();

    await interaction.deferReply({ ephemeral: true });

    if (!confirmed) {
      const guildCount = interaction.client.guilds.cache.size;
      const warningEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.warning} ⚠️ WARNING: Global Announcement`)
        .setColor(COLORS.warning)
        .setDescription(
          `**This will send a message to ALL ${guildCount} servers the bot is in!**\n\n` +
          `**Preview:**\n${announcementText}\n\n` +
          `To confirm, add \`--confirm\` to your message.`,
        )
        .setTimestamp();
      await interaction.editReply({ embeds: [warningEmbed] });
      return;
    }

    const { sent, failed } = await this.sendToAllGuilds(interaction.client, announcementText);

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.success} Global Announcement Sent`)
      .setColor(COLORS.success)
      .addFields(
        { name: 'Message', value: announcementText.slice(0, 1024), inline: false },
        { name: 'Sent', value: String(sent), inline: true },
        { name: 'Failed', value: String(failed), inline: true },
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    const rawMessage = _args.join(' ');
    if (!rawMessage) {
      await message.reply(`${EMOJIS.error} Usage: \`p!globalannounce <message> [--confirm]\``);
      return;
    }

    const confirmed = rawMessage.includes('--confirm');
    const announcementText = rawMessage.replace('--confirm', '').trim();

    if (!confirmed) {
      const guildCount = message.client.guilds.cache.size;
      const warningEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.warning} ⚠️ WARNING: Global Announcement`)
        .setColor(COLORS.warning)
        .setDescription(
          `**This will send a message to ALL ${guildCount} servers the bot is in!**\n\n` +
          `**Preview:**\n${announcementText}\n\n` +
          `To confirm, add \`--confirm\` to your message.`,
        )
        .setTimestamp();
      await message.reply({ embeds: [warningEmbed] });
      return;
    }

    const { sent, failed } = await this.sendToAllGuilds(message.client, announcementText);

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.success} Global Announcement Sent`)
      .setColor(COLORS.success)
      .addFields(
        { name: 'Message', value: announcementText.slice(0, 1024), inline: false },
        { name: 'Sent', value: String(sent), inline: true },
        { name: 'Failed', value: String(failed), inline: true },
      )
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default GlobalAnnounceCommand;
