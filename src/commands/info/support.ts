import { BaseCommand, CommandOptions } from '../../structures/BaseCommand';
import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { COLORS, EMOJIS } from '../../utils/Constants';

export class SupportCommand extends BaseCommand {
  constructor() {
    const options: CommandOptions = {
      name: 'support',
      description: 'Get the support server link',
      category: 'info',
      cooldown: 60,
      userPermissions: [],
      botPermissions: [],
      guildOnly: false,
      slashCommand: true,
      prefixCommand: true,
      aliases: ['server'],
      examples: ['/support', 'p!support'],
    };
    super(options);
  }

  public async executeSlash(interaction: ChatInputCommandInteraction): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Support Server`)
      .setColor(COLORS.info)
      .setDescription('Join our support server for help, suggestions, and community!')
      .addFields([
        { name: 'Support Server', value: '[Join Here](https://discord.gg/your-server)', inline: false },
        { name: 'Need Help?', value: 'Our support team is ready to assist you!', inline: false },
      ])
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  public async executePrefix(message: Message): Promise<void> {
    const embed = new EmbedBuilder()
      .setTitle(`${EMOJIS.info} Support Server`)
      .setColor(COLORS.info)
      .setDescription('Join our support server for help, suggestions, and community!')
      .addFields([
        { name: 'Support Server', value: '[Join Here](https://discord.gg/your-server)', inline: false },
        { name: 'Need Help?', value: 'Our support team is ready to assist you!', inline: false },
      ])
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  }
}

export default SupportCommand;
