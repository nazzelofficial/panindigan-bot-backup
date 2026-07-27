// @ts-nocheck
import { BaseCommand } from '../../structures/BaseCommand.js';
import { EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants.js';
const OWNER_COMMAND_GROUPS = [
    {
        name: '🤖 Bot Core Management',
        commands: ['restart', 'shutdown', 'reload', 'eval', 'exec', 'load', 'unload', 'setactivity', 'setstatus', 'setavatar', 'setname', 'hotreload', 'clearerrors', 'snapshot', 'version'],
    },
    {
        name: '🔷 Shard Control',
        commands: ['shardinfo', 'shardreset', 'shardeval', 'shardbroadcast', 'shardstats', 'shardspawn', 'shardkill', 'shardrebalance', 'shardping', 'shardlog'],
    },
    {
        name: '☢️ High-Risk Moderation',
        commands: ['nuke', 'massban', 'masskick', 'massmute', 'lockdown', 'unlockdown', 'stripperms', 'quarantine'],
    },
    {
        name: '🐘 Database Control',
        commands: ['dbstats', 'dbquery', 'dbbackup', 'dbrestore', 'dbclean', 'dbmigrate', 'dbflush', 'dbstatus', 'dbtables', 'dbvacuum'],
    },
    {
        name: '🏰 Guild Control',
        commands: ['guildlist', 'guildinfo', 'guildsend', 'guildleave', 'guildblacklist', 'guildpremium', 'guildsettings'],
    },
    {
        name: '👤 User Control',
        commands: ['userinfo', 'userblacklist', 'userset', 'userreset', 'premium grant', 'premium revoke', 'userdm', 'userwarn'],
    },
    {
        name: '🔑 Key Management',
        commands: ['keygen', 'keydelete', 'keylist', 'keyinfo', 'keyrevoke', 'keybulk', 'keyexport', 'keysales'],
    },
    {
        name: '📊 Analytics',
        commands: ['stats', 'system', 'logs', 'errorlogs', 'topcommands', 'topguilds', 'aiusage', 'premiumstats', 'growth'],
    },
];
export class OwnerHelpCommand extends BaseCommand {
    constructor() {
        super({ name: 'helpowner', description: 'View all owner-only commands (access check required) 🔑', category: 'help', premiumTier: 'free', cooldown: 5, guildOnly: false, slashCommand: true, prefixCommand: true, ownerOnly: false, aliases: ['ownerhelp', 'ownercmds'], examples: ['/helpowner', 'p!help owner'] });
    }
    async executeSlash(i) {
        const client = i.client;
        const isOwner = client.config?.owners?.includes(i.user.id) || false;
        if (!isOwner) {
            await i.reply({ content: `${EMOJIS.error} These commands are restricted to the **bot owner** only.\n\n> ⛔ No exceptions — not even Diamond tier users can access these.`, ephemeral: true });
            return;
        }
        await i.reply({ embeds: [this.buildEmbed()], ephemeral: true });
    }
    async executePrefix(m, _args) {
        const client = m.client;
        const isOwner = client.config?.owners?.includes(m.author.id) || false;
        if (!isOwner) {
            await m.reply(`${EMOJIS.error} These commands are restricted to the **bot owner** only.\n> ⛔ No exceptions.`);
            return;
        }
        await m.reply({ embeds: [this.buildEmbed()] });
    }
    buildEmbed() {
        const embed = new EmbedBuilder()
            .setTitle('🔑 Owner Commands — 122 Total')
            .setColor(COLORS.error)
            .setDescription('⚠️ **OWNER ONLY** — All executions are audit logged.\n\nAll commands are accessed via `p!owner <command>` prefix.')
            .setTimestamp();
        for (const group of OWNER_COMMAND_GROUPS) {
            embed.addFields({
                name: group.name,
                value: group.commands.map(c => `\`${c}\``).join(', '),
                inline: false,
            });
        }
        embed.setFooter({ text: '🔒 Restricted access • Full audit logging enabled' });
        return embed;
    }
}
export default OwnerHelpCommand;
