// @ts-nocheck
import { Event } from '../structures/BaseCommand.js';
import { GuildMember, PartialGuildMember, EmbedBuilder, TextChannel } from 'discord.js';
import { PanindiganClient } from '../structures/PanindiganClient.js';
import { COLORS } from '../utils/Constants.js';

export const event: Event = {
  name: 'guildMemberUpdate',
  once: false,
  async execute(oldMember: GuildMember | PartialGuildMember, newMember: GuildMember, client: PanindiganClient) {
    if (!newMember.guild) return;

    try {
      const { getPrismaClient } = await import('../database/postgresql/client.js');
      const prisma = getPrismaClient();
      const guildData = await prisma.guild.findUnique({
        where: { guildId: newMember.guild.id },
        select: { logChannelId: true },
      });

      if (!guildData?.logChannelId) return;
      const logChannel = newMember.guild.channels.cache.get(guildData.logChannelId) as TextChannel;
      if (!logChannel?.isTextBased()) return;

      // Nickname change
      if (oldMember.nickname !== newMember.nickname) {
        const embed = new EmbedBuilder()
          .setTitle('✏️ Nickname Changed')
          .setColor(COLORS.warning)
          .setThumbnail(newMember.user.displayAvatarURL({ size: 128 }))
          .addFields(
            { name: 'User', value: `${newMember.user.tag} (${newMember.user.id})`, inline: true },
            { name: 'Before', value: oldMember.nickname || '*(none)*', inline: true },
            { name: 'After', value: newMember.nickname || '*(none)*', inline: true },
          )
          .setTimestamp();
        await logChannel.send({ embeds: [embed] });
      }

      // Role changes
      const addedRoles = newMember.roles.cache.filter(r => !(oldMember.roles as any).cache?.has(r.id));
      const removedRoles = (oldMember.roles as any).cache?.filter((r: any) => !newMember.roles.cache.has(r.id));

      if (addedRoles.size > 0) {
        const embed = new EmbedBuilder()
          .setTitle('➕ Role(s) Added')
          .setColor(COLORS.success)
          .addFields(
            { name: 'User', value: `${newMember.user.tag}`, inline: true },
            { name: 'Roles', value: addedRoles.map(r => `<@&${r.id}>`).join(', '), inline: false },
          )
          .setTimestamp();
        await logChannel.send({ embeds: [embed] });
      }

      if (removedRoles?.size > 0) {
        const embed = new EmbedBuilder()
          .setTitle('➖ Role(s) Removed')
          .setColor(COLORS.error)
          .addFields(
            { name: 'User', value: `${newMember.user.tag}`, inline: true },
            { name: 'Roles', value: removedRoles.map((r: any) => `<@&${r.id}>`).join(', '), inline: false },
          )
          .setTimestamp();
        await logChannel.send({ embeds: [embed] });
      }

      // Timeout
      if (!oldMember.communicationDisabledUntil && newMember.communicationDisabledUntil) {
        const embed = new EmbedBuilder()
          .setTitle('⏱️ Member Timed Out')
          .setColor(COLORS.warning)
          .addFields(
            { name: 'User', value: `${newMember.user.tag} (${newMember.user.id})`, inline: true },
            { name: 'Until', value: `<t:${Math.floor(newMember.communicationDisabledUntil.getTime() / 1000)}:R>`, inline: true },
          )
          .setTimestamp();
        await logChannel.send({ embeds: [embed] });
      } else if (oldMember.communicationDisabledUntil && !newMember.communicationDisabledUntil) {
        const embed = new EmbedBuilder()
          .setTitle('✅ Timeout Removed')
          .setColor(COLORS.success)
          .addFields({ name: 'User', value: `${newMember.user.tag} (${newMember.user.id})`, inline: true })
          .setTimestamp();
        await logChannel.send({ embeds: [embed] });
      }
    } catch { /* Optional */ }
  },
};
