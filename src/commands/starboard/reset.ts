import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, SlashCommandBuilder, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { getCollection } from '../../database/mongodb/client';

export class StarboardResetCommand extends BaseCommand {
  constructor() {
    super({ name: 'starboard-reset', description: 'Reset (clear) all starboard data for this server', category: 'starboard', premiumTier: 'free', cooldown: 30, guildOnly: true, slashCommand: true, prefixCommand: true, userPermissions: [PermissionFlagsBits.Administrator], aliases: ['sb-reset', 'sbreset'], examples: ['/starboard-reset'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description).addBooleanOption(o => o.setName('confirm').setDescription('Confirm reset (true)').setRequired(true)).setDMPermission(false)) as SlashCommandBuilder;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const confirm = i.options.getBoolean('confirm', true);
    if (!confirm) { await i.reply({ content: '❌ Reset cancelled. Pass `confirm: true` to proceed.', ephemeral: true }); return; }
    await i.deferReply({ ephemeral: true });
    const col = getCollection('starboard');
    const result = await col.deleteMany({ guildId: i.guildId! });
    await i.editReply({ content: `✅ Starboard reset. Deleted **${result.deletedCount}** entries.` });
  }

  public async executePrefix(m: Message, args: string[]): Promise<void> {
    if (args[0] !== 'confirm') {
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId('starboard_reset_confirm').setLabel('✅ Confirm Reset').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('cancel').setLabel('❌ Cancel').setStyle(ButtonStyle.Secondary),
      );
      await m.reply({ content: '⚠️ **This will delete ALL starboard data!** Are you sure?', components: [row] });
      return;
    }
    const col = getCollection('starboard');
    const result = await col.deleteMany({ guildId: m.guildId! });
    await m.reply(`✅ Starboard reset. Deleted **${result.deletedCount}** entries.`);
  }
}
export default StarboardResetCommand;
