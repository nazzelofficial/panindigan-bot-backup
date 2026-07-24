import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class InviteCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'invite',
      description: 'Get the bot invite link to add it to your server',
      category: 'help',
      cooldown: 5,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['add', 'join'],
      examples: ['/invite', 'p!invite'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await this.showInvite(interaction);
  }

  public async executePrefix(message: Message): Promise<void> {
    await this.showInvite(message);
  }

  private async showInvite(interaction: ChatInputCommandInteraction | Message): Promise<void> {
    const client = interaction.client;
    const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${client.application.id}&permissions=8&scope=bot%20applications.commands`;
    const supportUrl = 'https://discord.gg/panindigan';

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.success} Invite ${client.user?.username}`)
      .setDescription(`Add ${client.user?.username} to your server and unlock all features!`)
      .setColor(COLORS.success)
      .addFields([
        { name: '🔗 Invite Link', value: `[Click here to invite](${inviteUrl})`, inline: false },
        { name: '🏠 Support Server', value: `[Join our community](${supportUrl})`, inline: false },
        { name: '✨ Features', value: '• 900+ Commands\n• Multi-provider AI\n• High-quality Music\n• Economy & Games\n• Premium Tiers', inline: false },
      ])
      .setFooter({ text: 'Thank you for choosing Panindigan!' })
      .setTimestamp();

    if (interaction instanceof ChatInputCommandInteraction) {
      await interaction.reply({ embeds: [embed] });
    } else {
      await interaction.reply({ embeds: [embed] });
    }
  }
}

export default InviteCommand;
