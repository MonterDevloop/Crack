const { EmbedBuilder } = require('discord.js');

const announcementThemes = {
  update: {
    title: '🚀 อัปเดตล่าสุด',
    color: 0x4f46e5,
    footer: 'Update • Discord Bot'
  },
  event: {
    title: '🎉 กิจกรรมพิเศษ',
    color: 0x22c55e,
    footer: 'Event • Discord Bot'
  },
  alert: {
    title: '⚠️ แจ้งเตือนสำคัญ',
    color: 0xef4444,
    footer: 'Alert • Discord Bot'
  }
};

function buildAnnouncement({ content, theme = 'update', authorTag }) {
  const selected = announcementThemes[theme] ?? announcementThemes.update;
  return new EmbedBuilder()
    .setTitle(selected.title)
    .setColor(selected.color)
    .setDescription(content)
    .setTimestamp(new Date())
    .setFooter({ text: selected.footer })
    .setAuthor({ name: authorTag ?? 'Announcement System' });
}

module.exports = {
  buildAnnouncement,
  announcementThemes
};
