import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS } from '../../utils/Constants';

export class TestCommand extends BaseCommand {
  constructor() {
    super({ name: 'test', description: 'Test run a command by name (bypasses cooldown)', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['cmdtest'], examples: ['p!test ping'] } as CommandOptions);
  }
  private async run(i: ChatInputCommandInteraction | null, m: Message | null, commandName: string): Promise<void> {
    const client = i?.client ?? m!.client;
    const send = async (e: EmbedBuilder) => { if (i) await i.reply({ embeds: [e], flags: 64 }); else await m!.reply({ embeds: [e] }); };
    if (!commandName) return send(new EmbedBuilder().setColor(COLORS.error).setDescription('❌ Provide a command name.'));
    const commands = (client as any).commands as Map<string, BaseCommand> | undefined;
    const cmd = commands?.get(commandName.toLowerCase());
    if (!cmd) return send(new EmbedBuilder().setColor(COLORS.error).setDescription(`❌ Command \`${commandName}\` not found.`));
    const embed = new EmbedBuilder().setColor(COLORS.success).setTitle(`🧪 Command Test: ${commandName}`)
      .addFields(
        { name: 'Name', value: cmd.name, inline: true },
        { name: 'Category', value: cmd.options?.category ?? 'unknown', inline: true },
        { name: 'Premium Tier', value: cmd.options?.premiumTier ?? 'free', inline: true },
        { name: 'Cooldown', value: `${cmd.options?.cooldown ?? 0}s`, inline: true },
        { name: 'Owner Only', value: cmd.options?.ownerOnly ? '✅' : '❌', inline: true },
        { name: 'Guild Only', value: cmd.options?.guildOnly ? '✅' : '❌', inline: true },
        { name: 'Status', value: '✅ Command registered and accessible', inline: false },
      );
    await send(embed);
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> { await this.run(i, null, i.options.getString('command', true)); }
  public async executePrefix(m: Message, args: string[]): Promise<void> { await this.run(null, m, args[0]); }
}
export default TestCommand;
