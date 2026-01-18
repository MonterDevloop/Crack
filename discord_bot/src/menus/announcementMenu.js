const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  StringSelectMenuBuilder
} = require('discord.js');

function buildMainMenu() {
  const embed = new EmbedBuilder()
    .setTitle('🎛️ เมนูควบคุมบอท')
    .setColor(0x0ea5e9)
    .setDescription('เลือกสิ่งที่ต้องการใช้งานด้านล่างนี้')
    .addFields(
      { name: '🎵 Music', value: 'เล่นเพลง / ดูคิว / ข้ามเพลง', inline: true },
      { name: '📣 Announcement', value: 'ประกาศแบบทันสมัย', inline: true }
    );

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('menu_music_queue')
      .setLabel('ดูคิวเพลง')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('menu_music_skip')
      .setLabel('ข้ามเพลง')
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('menu_announce')
      .setLabel('สร้างประกาศ')
      .setStyle(ButtonStyle.Success)
  );

  const selectRow = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('menu_announce_theme')
      .setPlaceholder('เลือกธีมประกาศ')
      .addOptions(
        { label: 'อัปเดต', value: 'update', description: 'เหมาะสำหรับอัปเดตทั่วไป' },
        { label: 'กิจกรรม', value: 'event', description: 'ประกาศกิจกรรมหรือของแจก' },
        { label: 'แจ้งเตือน', value: 'alert', description: 'แจ้งเตือนเรื่องสำคัญ' }
      )
  );

  return { embed, components: [buttons, selectRow] };
}

module.exports = {
  buildMainMenu
};
