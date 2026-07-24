import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
import { PanindiganClient } from '../../structures/PanindiganClient';

export class ReloadCommand extends BaseCommand {
  constructor() {
    super({ name: 'reload', description: 'Reload a command or all commands (Owner only)', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['rl'], examples: ['p!reload play', 'p!reload all'] } as CommandOptions);
  }
  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addStringOption(o => o.setName('command').setDescription('Command name or "all"').setRequired(true))) as SlashCommandBuilder;
  }

  private async doReload(client: PanindiganClient, target: string): Promise<string> {
    try {
      if (target === 'all') {
        await (client as any).loadCommands();
        return `✅ Reloaded all commands.`;
      }
      const cmd = client.commands.get(target) || client.commands.find(c => c.aliases?.includes(target));
      if (!cmd) return `❌ Command \`${target}\` not found.`;
      // Re-require the command file
      const path = require.resolve(`../${cmd.category}/${cmd.name}`);
      delete require.cache[path];
      const fresh = require(path);
      const instance = new (fresh.default || fresh[Object.keys(fresh)[0]])();
      client.commands.set(instance.name, instance);
      instance.aliases?.forEach((a: string) => client.aliases.set(a, instance.name));
      return `✅ Reloaded command \`${instance.name}\`.`;
    } catch (err: any) {
      return `❌ Failed to reload: ${err.message}`;
    }
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const target = i.options.getString('command', true);
    const result = await this.doReload(i.client as PanindiganClient, target);
    await i.reply({ content: result, ephemeral: true });
  }
  public async executePrefix(m: Message, args: string[]): Promise<void> {
    const target = args[0];
    if (!target) { await m.reply('❌ Specify a command name or "all".'); return; }
    const result = await this.doReload(m.client as PanindiganClient, target);
    await m.reply(result);
  }
}
export default ReloadCommand;
