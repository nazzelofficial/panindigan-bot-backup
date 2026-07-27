// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, ChannelType, PermissionFlagsBits } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';

export class UnlockdownCommand extends BaseCommand {
  constructor() {
    super({
      name: 'unlockdown',
      description: 'Unlock all channels in the server',
      category: 'owner',
      premiumTier: 'free',
      cooldown: 0,
      guildOnly: true,
      ownerOnly: true,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['servunlock'],
      examples: ['p!unlockdown'],
    } as CommandOptions);
  }

  private async run(interaction: ChatInputCommandInteraction | null, message: Message | null): Promise<void> {
    const guild = interaction?.guild ?? message?.guild;
    if (!guild) return;
    const send = async (e: EmbedBuilder) => {
      if (interaction) await interaction.reply({ embeds: [e], flags: 64 });
      else await message!.reply({ embeds: [e] });
    };
    await send(new EmbedBuilder().setColor(COLORS.default).setTitle('🔓 Unlocking Server...').setDescription('Restoring send message permissions...'));
    const everyoneRole = guild.roles.everyone;
    const channels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText);
    let done = 0;
    for (const [, ch] of channels) {
      try {
        await (ch as any).permissionOverwrites.edit(everyoneRole, { SendMessages: null });
        done++;
      } catch { /* skip */ }
    }
    const result = new EmbedBuilder().setColor(COLORS.success).setTitle('🔓 Server Unlocked')
      .setDescription(`Restored send permissions in **${done}** channels.`);
    if (interaction) await interaction.followUp({ embeds: [result], flags: 64 });
    else await message!.channel.send({ embeds: [result] });
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> { await this.run(interaction, null); }
  public async executePrefix(message: Message): Promise<void> { await this.run(null, message); }
}
export default UnlockdownCommand;
