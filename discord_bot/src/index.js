require('dotenv').config();
const {
  ActionRowBuilder,
  Client,
  EmbedBuilder,
  GatewayIntentBits,
  Partials,
  REST,
  Routes,
  SlashCommandBuilder
} = require('discord.js');
const { MusicPlayer } = require('./music/player');
const { buildAnnouncement, announcementThemes } = require('./utils/buildAnnouncement');
const { buildMainMenu } = require('./menus/announcementMenu');

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token || !clientId) {
  console.error('กรุณาตั้งค่า DISCORD_TOKEN และ CLIENT_ID ในไฟล์ .env');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

const musicPlayer = new MusicPlayer();

const commands = [
  new SlashCommandBuilder()
    .setName('play')
    .setDescription('เล่นเพลงจากลิงก์ YouTube')
    .addStringOption((option) =>
      option.setName('url').setDescription('ลิงก์ YouTube').setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName('skip')
    .setDescription('ข้ามเพลงที่กำลังเล่น'),
  new SlashCommandBuilder()
    .setName('stop')
    .setDescription('หยุดเพลงและล้างคิวทั้งหมด'),
  new SlashCommandBuilder()
    .setName('queue')
    .setDescription('ดูคิวเพลง'),
  new SlashCommandBuilder()
    .setName('announce')
    .setDescription('สร้างประกาศแบบทันสมัย')
    .addStringOption((option) =>
      option
        .setName('content')
        .setDescription('ข้อความประกาศ')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('theme')
        .setDescription('ธีมประกาศ')
        .addChoices(
          { name: 'อัปเดต', value: 'update' },
          { name: 'กิจกรรม', value: 'event' },
          { name: 'แจ้งเตือน', value: 'alert' }
        )
    )
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('ช่องที่จะส่งประกาศ')
        .setRequired(false)
    ),
  new SlashCommandBuilder()
    .setName('menu')
    .setDescription('เปิดเมนูควบคุมบอท')
].map((command) => command.toJSON());

async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(token);
  if (guildId) {
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands
    });
  } else {
    await rest.put(Routes.applicationCommands(clientId), { body: commands });
  }
}

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);
  await registerCommands();
  console.log('คำสั่งพร้อมใช้งานแล้ว');
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.isChatInputCommand()) {
    const { commandName } = interaction;

    if (commandName === 'play') {
      const url = interaction.options.getString('url', true);
      const voiceChannel = interaction.member.voice.channel;

      if (!voiceChannel) {
        await interaction.reply({
          content: '⚠️ กรุณาเข้าห้องเสียงก่อนใช้คำสั่งนี้',
          ephemeral: true
        });
        return;
      }

      await interaction.reply({ content: '✅ เพิ่มเพลงเข้าคิวแล้ว' });
      await musicPlayer.enqueue({
        guildId: interaction.guildId,
        voiceChannel,
        textChannel: interaction.channel,
        url,
        requestedBy: interaction.user.tag
      });
    }

    if (commandName === 'skip') {
      musicPlayer.skip(interaction.guildId);
      await interaction.reply({ content: '⏭️ ข้ามเพลงแล้ว' });
    }

    if (commandName === 'stop') {
      const message = musicPlayer.stop(interaction.guildId);
      await interaction.reply({ content: message ?? '🛑 หยุดเพลงแล้ว' });
    }

    if (commandName === 'queue') {
      const queue = musicPlayer.getQueue(interaction.guildId);
      const content = queue.length
        ? queue.join('\n')
        : 'คิวว่างอยู่ตอนนี้';
      await interaction.reply({ content });
    }

    if (commandName === 'announce') {
      const content = interaction.options.getString('content', true);
      const theme = interaction.options.getString('theme') ?? 'update';
      const channel =
        interaction.options.getChannel('channel') ?? interaction.channel;

      const embed = buildAnnouncement({
        content,
        theme,
        authorTag: interaction.user.tag
      });

      await channel.send({ embeds: [embed] });
      await interaction.reply({
        content: `📣 ส่งประกาศไปที่ ${channel} แล้ว`,
        ephemeral: true
      });
    }

    if (commandName === 'menu') {
      const { embed, components } = buildMainMenu();
      await interaction.reply({ embeds: [embed], components });
    }
  }

  if (interaction.isButton()) {
    if (interaction.customId === 'menu_music_queue') {
      const queue = musicPlayer.getQueue(interaction.guildId);
      const content = queue.length
        ? queue.join('\n')
        : 'คิวว่างอยู่ตอนนี้';
      await interaction.reply({ content, ephemeral: true });
    }

    if (interaction.customId === 'menu_music_skip') {
      musicPlayer.skip(interaction.guildId);
      await interaction.reply({ content: '⏭️ ข้ามเพลงแล้ว', ephemeral: true });
    }

    if (interaction.customId === 'menu_announce') {
      const hint = new EmbedBuilder()
        .setTitle('📣 สร้างประกาศแบบทันสมัย')
        .setColor(0x38bdf8)
        .setDescription(
          'พิมพ์ /announce เพื่อส่งประกาศ หรือเลือกธีมจากเมนูด้านล่างเพื่อดูตัวอย่าง'
        );
      await interaction.reply({ embeds: [hint], ephemeral: true });
    }
  }

  if (interaction.isStringSelectMenu()) {
    if (interaction.customId === 'menu_announce_theme') {
      const theme = interaction.values[0];
      const preview = buildAnnouncement({
        content: 'นี่คือข้อความตัวอย่างสำหรับประกาศของคุณ',
        theme,
        authorTag: interaction.user.tag
      });
      const themeLabel = announcementThemes[theme]?.title ?? 'ประกาศ';
      await interaction.reply({
        content: `ตัวอย่างธีม: ${themeLabel}`,
        embeds: [preview],
        ephemeral: true
      });
    }
  }
});

client.login(token);
