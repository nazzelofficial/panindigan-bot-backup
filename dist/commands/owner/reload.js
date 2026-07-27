// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { SlashCommandBuilder } from 'discord.js';
export class ReloadCommand extends BaseCommand {
    constructor() {
        super({ name: 'reload', description: 'Reload a command or all commands (Owner only)', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['rl'], examples: ['p!reload play', 'p!reload all'] });
    }
    buildSlashCommand() {
        return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
            .addStringOption(o => o.setName('command').setDescription('Command name or "all"').setRequired(true)));
    }
    async doReload(client, target) {
        try {
            if (target === 'all') {
                await client.loadCommands();
                return `✅ Reloaded all commands.`;
            }
            const cmd = client.commands.get(target) || client.commands.find(c => c.aliases?.includes(target));
            if (!cmd)
                return `❌ Command \`${target}\` not found.`;
            // Dynamic import the command file
            const modulePath = `../${cmd.category}/${cmd.name}.js`;
            const fresh = await import(modulePath);
            const instance = new (fresh.default || fresh[Object.keys(fresh)[0]])();
            client.commands.set(instance.name, instance);
            instance.aliases?.forEach((a) => client.aliases.set(a, instance.name));
            return `✅ Reloaded command \`${instance.name}\`.`;
        }
        catch (err) {
            return `❌ Failed to reload: ${err.message}`;
        }
    }
    async executeSlash(i) {
        const target = i.options.getString('command', true);
        const result = await this.doReload(i.client, target);
        await i.reply({ content: result, ephemeral: true });
    }
    async executePrefix(m, _args) {
        const target = args[0];
        if (!target) {
            await m.reply('❌ Specify a command name or "all".');
            return;
        }
        const result = await this.doReload(m.client, target);
        await m.reply(result);
    }
}
export default ReloadCommand;
