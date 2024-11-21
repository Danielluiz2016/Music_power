require('dotenv').config(); // Carregar variáveis do arquivo .env

module.exports = {
  name: 'autodj',
  description: 'Inicia o AutoDJ com playlists configuradas no .env',
  async execute(message, args) {
    const voiceChannel = message.member.voice.channel;

    if (!voiceChannel) {
      return message.channel.send('❌ Você precisa estar em um canal de voz para iniciar o AutoDJ.');
    }

    try {
      // Obter as playlists do .env
      const playlists = process.env.PLAYLISTS?.split(',') || [];
      if (playlists.length === 0) {
        return message.channel.send('❌ Nenhuma playlist foi configurada no arquivo .env.');
      }

      // Escolher uma playlist aleatória
      const randomPlaylist = playlists[Math.floor(Math.random() * playlists.length)];

      // Tocar a playlist no canal de voz
      await message.client.distube.play(voiceChannel, randomPlaylist, {
        textChannel: message.channel,
        member: message.member,
        skip: false, // Certifica-se de que as músicas serão adicionadas à fila
      });

      await message.channel.send(
        `🎶 O modo **AutoDJ** foi iniciado! Tocando músicas da playlist: [Clique aqui](${randomPlaylist}).`
      );
    } catch (error) {
      console.error('Erro ao iniciar o AutoDJ:', error);
      await message.channel.send('❌ Ocorreu um erro ao tentar iniciar o AutoDJ.');
    }
  },
};
