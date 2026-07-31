import { BaseCommand } from '../../structures/BaseCommand.js';
import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
export declare class InfoCommand extends BaseCommand {
    constructor();
    buildSlashCommand(): SlashCommandBuilder;
    executeSlash(i: ChatInputCommandInteraction): Promise<void>;
    private handleUser;
    private handleAvatar;
    private handleBanner;
    private handleServer;
    private handleRoles;
    private handleChannels;
    private handleMembers;
    private handleBans;
    private handleEmojis;
    private handleRoleInfo;
    private handleChannelInfo;
    private handleBot;
    private handlePing;
    private handleUptime;
    private handleStats;
    private handleId;
    private handleSnowflake;
    private handlePermissions;
    private handleEmojiInfo;
    private handleWeather;
    private handleTime;
    private handleWikipedia;
    private handleUrban;
    private handleGithub;
    private handleCountry;
    executePrefix(m: Message, args: string[]): Promise<void>;
}
export default InfoCommand;
//# sourceMappingURL=info.d.ts.map