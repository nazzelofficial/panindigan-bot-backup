import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';

function parseDuration(str: string): number {
  const match = str.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return 600000;
  const n = parseInt(match[1]);
  const unit: Record<string, number> = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return n * unit[match[2]];
}

export class MassmuteCommand extends BaseCommand {
  constructor() {
    super({
      name: 'massmute',
      description: 'Mass timeout all members with a specific role',
      category: 'owner',
      premiumTier: 'free',
      cooldown: 0,
      guildOnly: true,
      ownerOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['mmute'],
      examples: ['p!massmute @role 1h'],
    } as CommandOptions);
  }

  private async run(interaction: ChatInputCommandInteraction | null, message: Message | null, args: string[]): Promise<void> {
    const guild = interaction?.guild ?? message?.guild;
    if (!guild) return;
    const send = async (e: EmbedBuilder) => {
      if (interaction) await interaction.reply({ embeds: [e], flags: 64 });
      else await message!.reply({ embeds: [e] });
    };
    if (args.length < 2) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Usage: `massmute <role_id> <duration>`\nExample: `massmute @role 1h`'));
    const roleId = args[0].replace(/[<@&>]/g, '');
    const role = guild.roles.cache.get(roleId);
    if (!role) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Role not found.'));
    const duration = parseDuration(args[1]);
    await guild.members.fetch();
    const targets = guild.members.cache.filter(m => m.roles.cache.has(role.id) && m.moderatable && !m.user.bot);
    if (!targets.size) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ No moderatable members with that role.'));
    await send(new EmbedBuilder().setColor(COLORS.default).setTitle('🔇 Mass Mute').setDescription(`Muting **${targets.size}** members for **${args[1]}**...`));
    let success = 0, failed = 0;
    for (const [, member] of targets) {
      try { await member.timeout(duration, 'Mass mute by bot owner'); success++; } catch { failed++; }
    }
    const result = new EmbedBuilder().setColor(COLORS.success).setTitle('🔇 Mass Mute Complete')
      .addFields({ name: '✅ Muted', value: `${success}`, inline: true }, { name: '❌ Failed', value: `${failed}`, inline: true });
    if (interaction) await interaction.followUp({ embeds: [result], flags: 64 });
    else await message!.channel.send({ embeds: [result] });
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    await this.run(interaction, null, [interaction.options.getString('role', true), interaction.options.getString('duration') ?? '10m']);
  }
  public async executePrefix(message: Message, args: string[]): Promise<void> {
    await this.run(null, message, args);
  }
}
export default MassmuteCommand;
