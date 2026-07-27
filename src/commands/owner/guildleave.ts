// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';

export class GuildLeaveCommand extends BaseCommand {
  constructor() {
    super({
      name: 'guildleave',
      description: 'Force the bot to leave a server',
      category: 'owner',
      premiumTier: 'free',
      cooldown: 0,
      ownerOnly: true,
      guildOnly: false,
      slashCommand: false,
      prefixCommand: true,
      aliases: ['leaveserver', 'gleave'],
      examples: ['p!guildleave 123456789', 'p!guildleave 123456789 confirm'],
    } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return new SlashCommandBuilder().setName(this.name).setDescription(this.description).setDMPermission(false) as SlashCommandBuilder;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    await i.reply({ content: 'Use prefix command `p!guildleave <guildId> [confirm]` for this.', ephemeral: true });
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    try {
      const guildId = args[0];
      if (!guildId) {
        await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Provide a guild ID.')] });
        return;
      }

      const guild = m.client.guilds.cache.get(guildId);
      if (!guild) {
        await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ Guild \`${guildId}\` not found.`)] });
        return;
      }

      if (args[1]?.toLowerCase() !== 'confirm') {
        const confirmEmbed = new EmbedBuilder()
          .setTitle('⚠️ Confirm Guild Leave')
          .setColor(COLORS.warning)
          .setDescription(`Are you sure you want to leave **${guild.name}** (\`${guild.id}\`)?\n\nRun \`p!guildleave ${guildId} confirm\` to proceed.`)
          .addFields({ name: 'Members', value: `${guild.memberCount}`, inline: true })
          .setTimestamp();
        await m.reply({ embeds: [confirmEmbed] });
        return;
      }

      const guildName = guild.name;
      await guild.leave();

      const embed = new EmbedBuilder()
        .setTitle('✅ Left Guild')
        .setColor(COLORS.success)
        .setDescription(`Successfully left **${guildName}** (\`${guildId}\`).`)
        .setTimestamp();

      await m.reply({ embeds: [embed] });
    } catch (err: any) {
      await m.reply({ embeds: [new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ Error: ${err?.message}`)] });
    }
  }
}

export default GuildLeaveCommand;
