// @ts-nocheck
import { BaseCommand, CommandOptions } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { COLORS } from '../../utils/Constants.js';
import { LevelingHandler } from '../../handlers/LevelingHandler.js';

export class XpCommand extends BaseCommand {
  constructor() {
    super({ name: 'xp', description: 'Give, remove, or set XP for a user (Admin only)', category: 'leveling', premiumTier: 'free', cooldown: 3, guildOnly: true, slashCommand: true, prefixCommand: true, userPermissions: [PermissionFlagsBits.ManageGuild], aliases: ['givexp', 'setxp'], examples: ['/xp give @user 500', '/xp remove @user 100', '/xp set @user 1000'] } as CommandOptions);
  }

  public buildSlashCommand(): SlashCommandBuilder {
    return (new SlashCommandBuilder().setName(this.name).setDescription(this.description)
      .addSubcommand(s => s.setName('give').setDescription('Give XP to a user')
        .addUserOption(o => o.setName('user').setDescription('Target user').setRequired(true))
        .addIntegerOption(o => o.setName('amount').setDescription('Amount of XP').setRequired(true).setMinValue(1).setMaxValue(100000)))
      .addSubcommand(s => s.setName('remove').setDescription('Remove XP from a user')
        .addUserOption(o => o.setName('user').setDescription('Target user').setRequired(true))
        .addIntegerOption(o => o.setName('amount').setDescription('Amount of XP').setRequired(true).setMinValue(1).setMaxValue(100000)))
      .addSubcommand(s => s.setName('set').setDescription('Set a user\'s XP')
        .addUserOption(o => o.setName('user').setDescription('Target user').setRequired(true))
        .addIntegerOption(o => o.setName('amount').setDescription('XP amount').setRequired(true).setMinValue(0)))
      .setDMPermission(false)) as SlashCommandBuilder;
  }

  public async executeSlash(i: ChatInputCommandInteraction): Promise<void> {
    const sub = i.options.getSubcommand();
    const target = i.options.getUser('user', true);
    const amount = i.options.getInteger('amount', true);
    const handler = new LevelingHandler();
    let msg = '';
    if (sub === 'give') { await handler.addXP(target.id, i.guildId!, amount); msg = `✅ Gave **${amount} XP** to **${target.username}**.`; }
    else if (sub === 'remove') { await handler.removeXP(target.id, i.guildId!, amount); msg = `✅ Removed **${amount} XP** from **${target.username}**.`; }
    else if (sub === 'set') { await handler.setUserXP(target.id, i.guildId!, amount); msg = `✅ Set **${target.username}**'s XP to **${amount}**.`; }
    await i.reply({ content: msg, ephemeral: true });
  }

  public async executePrefix(m: Message, _args: string[]): Promise<void> {
    const [sub, , rawAmount] = _args;
    const target = m.mentions.users.first();
    const amount = parseInt(rawAmount);
    if (!target || !sub || isNaN(amount)) { await m.reply('❌ Usage: `p!xp <give|remove|set> @user <amount>`'); return; }
    const handler = new LevelingHandler();
    if (sub === 'give') { await handler.addXP(target.id, m.guildId!, amount); await m.reply(`✅ Gave **${amount} XP** to **${target.username}**.`); }
    else if (sub === 'remove') { await handler.removeXP(target.id, m.guildId!, amount); await m.reply(`✅ Removed **${amount} XP** from **${target.username}**.`); }
    else if (sub === 'set') { await handler.setUserXP(target.id, m.guildId!, amount); await m.reply(`✅ Set **${target.username}**'s XP to **${amount}**.`); }
    else await m.reply('❌ Unknown subcommand. Use `give`, `remove`, or `set`.');
  }
}
export default XpCommand;
