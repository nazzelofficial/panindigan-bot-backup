import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class MuteCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'mute',
      description: 'Mute a user in the server',
      category: 'utility',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.ModerateMembers],
      botPermissions: [PermissionFlagsBits.ModerateMembers],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: [],
      examples: ['/mute @user', '/mute @user 1h', 'p!mute @user'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('user');
    const duration = interaction.options.getString('duration') || '10m';
    
    if (!user) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a user to mute.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const member = await interaction.guild?.members.fetch(user.id);
    if (!member) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Could not find that member.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    const muteDuration = this.parseDuration(duration);
    if (!muteDuration) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Invalid duration format. Use format like 10m, 1h, 1d.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
      return;
    }

    try {
      await member.timeout(muteDuration);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} User Muted`)
        .setColor(COLORS.success)
        .setDescription(`${user} has been muted for ${duration}.`)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Could not mute user. Make sure I have the required permissions and the user is not higher in role hierarchy.')
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed] });
    }
  }

  public async executePrefix(message: Message): Promise<void> {
    const args = message.content.split(' ').slice(1);
    const user = message.mentions.users.first();
    const duration = args[1] || '10m';

    if (!user) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Please provide a user to mute.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const member = await message.guild?.members.fetch(user.id);
    if (!member) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Could not find that member.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    const muteDuration = this.parseDuration(duration);
    if (!muteDuration) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Invalid duration format. Use format like 10m, 1h, 1d.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
      return;
    }

    try {
      await member.timeout(muteDuration);

      const embed = new EmbedBuilder()
        .setTitle(`${EMOJIS.success} User Muted`)
        .setColor(COLORS.success)
        .setDescription(`${user} has been muted for ${duration}.`)
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    } catch (error) {
      const errorEmbed = new EmbedBuilder()
        .setTitle(`${EMOJIS.error} Error`)
        .setColor(COLORS.error)
        .setDescription('Could not mute user. Make sure I have the required permissions and the user is not higher in role hierarchy.')
        .setTimestamp();

      await message.reply({ embeds: [errorEmbed] });
    }
  }

  private parseDuration(duration: string): number | null {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) return null;

    const value = parseInt(match[1]);
    const unit = match[2];

    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60000,
      h: 3600000,
      d: 86400000,
    };

    return value * (multipliers[unit] || 0);
  }
}

export default MuteCommand;
