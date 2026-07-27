// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';

export class MassbanCommand extends BaseCommand {
  constructor() {
    super({
      name: 'massban',
      description: 'Mass ban multiple users or all members with a role',
      category: 'owner',
      premiumTier: 'free',
      cooldown: 0,
      guildOnly: true,
      ownerOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['mb'],
      examples: ['p!massban @role', 'p!massban 123456789 987654321'],
    } as CommandOptions);
  }

  private async doMassBan(interaction: ChatInputCommandInteraction | null, message: Message | null, _args: string[]): Promise<void> {
    const guild = interaction?.guild ?? message?.guild;
    if (!guild) return;
    const send = async (e: EmbedBuilder) => {
      if (interaction) await interaction.reply({ embeds: [e], flags: 64 });
      else await message!.reply({ embeds: [e] });
    };

    if (!args.length) {
      return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Provide a role ID or list of user IDs.'));
    }

    // Check if first arg is a role ID
    const roleId = args[0].replace(/[<@&>]/g, '');
    const role = guild.roles.cache.get(roleId);
    let targets: string[] = [];

    if (role) {
      await guild.members.fetch();
      targets = guild.members.cache.filter(m => m.roles.cache.has(role.id) && !m.user.bot).map(m => m.id);
    } else {
      targets = _args.map(a => a.replace(/[<@!>]/g, ''));
    }

    if (!targets.length) {
      return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ No valid targets found.'));
    }

    const embed = new EmbedBuilder()
      .setColor(COLORS.default)
      .setTitle('🔨 Mass Ban')
      .setDescription(`Banning **${targets.length}** users... Please wait.`);
    await send(embed);

    let success = 0, failed = 0;
    for (const userId of targets) {
      try {
        await guild.bans.create(userId, { reason: `Mass ban executed by bot owner` });
        success++;
      } catch { failed++; }
    }

    const result = new EmbedBuilder()
      .setColor(COLORS.success)
      .setTitle('🔨 Mass Ban Complete')
      .addFields(
        { name: '✅ Banned', value: `${success}`, inline: true },
        { name: '❌ Failed', value: `${failed}`, inline: true }
      );
    if (interaction) await interaction.followUp({ embeds: [result], flags: 64 });
    else await message!.channel.send({ embeds: [result] });
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const targets = interaction.options.getString('targets', true).split(' ');
    await this.doMassBan(interaction, null, targets);
  }

  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    await this.doMassBan(null, message, args);
  }
}

export default MassbanCommand;
