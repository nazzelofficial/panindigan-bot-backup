// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message } from 'discord.js';

export class RestartCommand extends BaseCommand {
  constructor() {
    super({ name: 'restart', description: 'Restart the bot process (Owner only)', category: 'owner', premiumTier: 'free', cooldown: 0, guildOnly: false, ownerOnly: true, slashCommand: true, prefixCommand: true, aliases: ['reboot', 'reset'], examples: ['p!restart'] } as CommandOptions);
  }
  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    await i.reply({ content: '🔄 Restarting bot...', ephemeral: true });
    setTimeout(() => process.exit(0), 1000);
  }
  public async executePrefix(m: Message): Promise<void> {
    await m.reply('🔄 Restarting bot...');
    setTimeout(() => process.exit(0), 1000);
  }
}
export default RestartCommand;
