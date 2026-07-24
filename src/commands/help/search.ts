import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class SearchCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'search',
      description: 'Search for commands by name or keyword',
      category: 'help',
      cooldown: 5,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['find', 'cmdsearch'],
      examples: ['/search music', 'p!search economy'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const query = interaction.options.getString('query');
    if (!query) {
      await interaction.reply({ content: '❌ Please provide a search query.', ephemeral: true });
      return;
    }
    await this.searchCommands(interaction, query);
  }

  public async executePrefix(message: Message, args: string[]): Promise<void> {
    const query = args[0];
    if (!query) {
      await message.reply('❌ Please provide a search query.');
      return;
    }
    await this.searchCommands(message, query);
  }

  private async searchCommands(interaction: ChatInputCommandInteraction | Message, query: string): Promise<void> {
    const client = interaction.client;
    const commands = (client as any).commands;
    
    const matchingCommands = commands.filter((cmd: any) => 
      cmd.name.toLowerCase().includes(query.toLowerCase()) ||
      cmd.description.toLowerCase().includes(query.toLowerCase()) ||
      cmd.category.toLowerCase().includes(query.toLowerCase()) ||
      cmd.aliases.some((alias: string) => alias.toLowerCase().includes(query.toLowerCase()))
    );

    if (matchingCommands.size === 0) {
      if (interaction instanceof ChatInputCommandInteraction) {
        await interaction.reply({ content: `❌ No commands found matching "${query}".`, ephemeral: true });
      } else {
        await interaction.reply(`❌ No commands found matching "${query}".`);
      }
      return;
    }

    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Search Results for "${query}"`)
      .setDescription(`Found ${matchingCommands.size} matching command(s)`)
      .setColor(COLORS.info);

    const commandList = Array.from(matchingCommands.values())
      .slice(0, 25)
      .map((cmd: any) => `\`${cmd.name}\` - ${cmd.description}`)
      .join('\n');

    embed.addField('Commands', commandList);

    if (matchingCommands.size > 25) {
      embed.setFooter({ text: `Showing 25 of ${matchingCommands.size} results` });
    }

    if (interaction instanceof ChatInputCommandInteraction) {
      await interaction.reply({ embeds: [embed] });
    } else {
      await interaction.reply({ embeds: [embed] });
    }
  }
}

export default SearchCommand;
