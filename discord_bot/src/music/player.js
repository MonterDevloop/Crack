const {
  AudioPlayerStatus,
  NoSubscriberBehavior,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  VoiceConnectionStatus
} = require('@discordjs/voice');
const ytdl = require('ytdl-core');

class MusicPlayer {
  constructor() {
    this.queues = new Map();
  }

  ensureQueue(guildId) {
    if (!this.queues.has(guildId)) {
      this.queues.set(guildId, {
        tracks: [],
        playing: false,
        connection: null,
        player: createAudioPlayer({
          behaviors: {
            noSubscriber: NoSubscriberBehavior.Pause
          }
        })
      });
    }
    return this.queues.get(guildId);
  }

  async enqueue({ guildId, voiceChannel, textChannel, url, requestedBy }) {
    const queue = this.ensureQueue(guildId);
    queue.tracks.push({ url, requestedBy });

    if (!queue.connection) {
      queue.connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator
      });
      queue.connection.on(VoiceConnectionStatus.Disconnected, () => {
        this.stop(guildId, { notify: false });
        textChannel.send('⚠️ หลุดจากห้องเสียงแล้ว ยกเลิกคิวเพลงเรียบร้อย');
      });
      queue.connection.subscribe(queue.player);
    }

    if (!queue.playing) {
      await this.playNext(guildId, textChannel);
    }
  }

  async playNext(guildId, textChannel) {
    const queue = this.ensureQueue(guildId);
    const next = queue.tracks.shift();
    if (!next) {
      queue.playing = false;
      textChannel.send('✅ เล่นเพลงครบแล้ว');
      return;
    }

    queue.playing = true;
    const stream = ytdl(next.url, {
      filter: 'audioonly',
      quality: 'highestaudio',
      highWaterMark: 1 << 25
    });
    const resource = createAudioResource(stream);
    queue.player.play(resource);

    textChannel.send(`🎶 กำลังเล่น: ${next.url}\nขอโดย: ${next.requestedBy}`);

    queue.player.once(AudioPlayerStatus.Idle, async () => {
      await this.playNext(guildId, textChannel);
    });

    queue.player.on('error', (error) => {
      textChannel.send(`❌ เล่นเพลงไม่ได้: ${error.message}`);
    });
  }

  skip(guildId) {
    const queue = this.ensureQueue(guildId);
    queue.player.stop(true);
  }

  stop(guildId, { notify = true } = {}) {
    const queue = this.ensureQueue(guildId);
    queue.tracks = [];
    queue.playing = false;
    queue.player.stop();
    if (queue.connection) {
      queue.connection.destroy();
      queue.connection = null;
    }
    if (notify) {
      return '🛑 หยุดเพลงและล้างคิวแล้ว';
    }
    return null;
  }

  getQueue(guildId) {
    const queue = this.ensureQueue(guildId);
    return queue.tracks.map((track, index) => `${index + 1}. ${track.url}`);
  }
}

module.exports = {
  MusicPlayer
};
