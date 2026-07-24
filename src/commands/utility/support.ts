import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class SupportCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'support',
      description: 'Get a link to the support server',
      category: 'utility',
      cooldown: 5,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: [],
      examples: ['/support', 'p!support'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 🆘 Support Server`)
      .setColor(COLORS.info)
      .setDescription('Join our support server for help, updates, and community!')
      .addFields([
        { name: 'Support Server', value: '[Join here](https://discord.gg/panindigan)', inline: true },
      ])
      .setFooter({ text: 'We\'re here to help!' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} 🆘 Support Server`)
      .setColor(COLORS.info)
      .setDescription('Join our support server for help, updates, and community!')
      .addFields([
        { name: 'Support Server', value: '[Join here](https://discord.gg/panindigan)', inline: true },
      ])
      .setFooter({ text: 'We\'re here to help!' })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default SupportCommand;
