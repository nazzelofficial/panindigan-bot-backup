import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class ModeratorsCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'moderators',
      description: 'List all moderators in the server',
      category: 'moderation',
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.ModerateMembers],
      botPermissions: [PermissionFlagsBits.ModerateMembers],
      guildOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['mods', 'modlist'],
      examples: ['/moderators', 'p!moderators'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await this.showModerators(interaction);
  }

  public async executePrefix(message: Message): Promise<void> {
    await this.showModerators(message);
  }

  private async showModerators(interaction: ChatInputCommandInteraction | Message): Promise<void> {
    if (!interaction.guild) return;

    const moderators = interaction.guild.members.cache.filter(member => 
      member.permissions.has(PermissionFlagsBits.ModerateMembers) && !member.user.bot
    );

    const admins = moderators.filter(member => 
      member.permissions.has(PermissionFlagsBits.Administrator)
    );

    const mods = moderators.filter(member => 
      !member.permissions.has(PermissionFlagsBits.Administrator)
    );

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.moderation} Server Moderators`)
      .setColor(COLORS.info)
      .addFields([
        { name: 'Administrators', value: admins.size > 0 ? admins.map(m => m.user.tag).join('\n') || 'None' : 'None', inline: true },
        { name: 'Moderators', value: mods.size > 0 ? mods.map(m => m.user.tag).join('\n') || 'None' : 'None', inline: true },
        { name: 'Total', value: moderators.size.toString(), inline: true },
      ])
      .setTimestamp();

    if (interaction instanceof ChatInputCommandInteraction) {
      await interaction.reply({ embeds: [embed] });
    } else {
      await interaction.reply({ embeds: [embed] });
    }
  }
}

export default ModeratorsCommand;
