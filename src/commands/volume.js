module.exports = {
    name: 'volume',
    description: 'Altera o volume do bot no canal de voz.',
    async execute(message, args) {
      // Verifica se o membro está em um canal de voz
      const voiceChannel = message.member.voice.channel;
      if (!voiceChannel) {
        return message.channel.send('❌ Você precisa estar em um canal de voz para alterar o volume!');
      }
  
      // Verifica se foi fornecido um valor de volume
      const volume = parseInt(args[0], 10);
      if (!volume || volume < 1 || volume > 100) {
        return message.channel.send('❌ Por favor, forneça um valor de volume entre 1 e 100.');
      }
  
      try {
        // Ajusta o volume do bot no canal
        await message.client.distube.setVolume(voiceChannel, volume);
        
        // Confirmação de que o volume foi ajustado
        await message.channel.send(`🔊 O volume foi ajustado para **${volume}%**.`);
      } catch (error) {
        // Tratamento de erros
        console.error('Erro ao ajustar o volume:', error);
        await message.channel.send('❌ Ocorreu um erro ao tentar ajustar o volume.');
      }
    },
  };
  