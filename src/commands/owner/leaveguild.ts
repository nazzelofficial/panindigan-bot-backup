import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js';

export class LeaveGuildCommand extends BaseCommand {
  constructor() {
    super({ name: 'leaveguild', description: 'Force bot to leave a guild (Owner only)', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['leaveserver', 'kick-guild'], examples: ['p!leaveguild 123456789012345678'] } as CommandOptions);
  }
  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addStringOption(o => o.setName('guild_id').setDescription('Guild ID to leave').setRequired(true))) as SlashCommandBuilder;
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const guildId = i.options.getString('guild_id', true);
    const guild = i.client.guilds.cache.get(guildId);
    if (!guild) { await i.reply({ content: '❌ Not in that guild.', ephemeral: true }); return; }
    const name = guild.name;
    await guild.leave();
    await i.reply({ content: `✅ Left guild **${name}** (\`${guildId}\`).`, ephemeral: true });
  }
  public async executePrefix(m: Message, args: string[]): Promise<void> {
    const guildId = args[0]; if (!guildId) { await m.reply('❌ Provide a guild ID.'); return; }
    const guild = m.client.guilds.cache.get(guildId);
    if (!guild) { await m.reply('❌ Not in that guild.'); return; }
    const name = guild.name;
    await guild.leave();
    await m.reply(`✅ Left guild **${name}**.`);
  }
}
export default LeaveGuildCommand;
