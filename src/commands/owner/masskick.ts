// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';

export class MasskickCommand extends BaseCommand {
  constructor() {
    super({
      name: 'masskick',
      description: 'Mass kick all members with a specific role',
      category: 'owner',
      premiumTier: 'free',
      cooldown: 0,
      guildOnly: true,
      ownerOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['mk'],
      examples: ['p!masskick @role'],
    } as CommandOptions);
  }

  private async run(interaction: ChatInputCommandInteraction | null, message: Message | null, _args: string[]): Promise<void> {
    const guild = interaction?.guild ?? message?.guild;
    if (!guild) return;
    const send = async (e: EmbedBuilder) => {
      if (interaction) await interaction.reply({ embeds: [e], flags: 64 });
      else await message!.reply({ embeds: [e] });
    };
    if (!args[0]) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Provide a role ID.'));
    const roleId = args[0].replace(/[<@&>]/g, '');
    const role = guild.roles.cache.get(roleId);
    if (!role) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Role not found.'));
    await guild.members.fetch();
    const targets = guild.members.cache.filter(m => m.roles.cache.has(role.id) && m.kickable && !m.user.bot);
    if (!targets.size) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ No kickable members with that role.'));
    await send(new EmbedBuilder().setColor(COLORS.default).setTitle('👢 Mass Kick').setDescription(`Kicking **${targets.size}** members from role **${role.name}**...`));
    let success = 0, failed = 0;
    for (const [, member] of targets) {
      try { await member.kick('Mass kick by bot owner'); success++; } catch { failed++; }
    }
    const result = new EmbedBuilder().setColor(COLORS.success).setTitle('👢 Mass Kick Complete')
      .addFields({ name: '✅ Kicked', value: `${success}`, inline: true }, { name: '❌ Failed', value: `${failed}`, inline: true });
    if (interaction) await interaction.followUp({ embeds: [result], flags: 64 });
    else await message!.channel.send({ embeds: [result] });
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await this.run(interaction, null, [interaction.options.getString('role', true)]);
  }
  public async executePrefix(message: Message, _args: string[]): Promise<void> {
    await this.run(null, message, args);
  }
}
export default MasskickCommand;
