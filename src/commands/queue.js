const { EmbedBuilder, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');

const EMBED_DATA_FILE = path.join(__dirname, 'embedData.json'); // Arquivo para salvar o ID da embed

module.exports = {
  name: 'queue',
  description: 'Mostra e atualiza a fila de músicas em um canal dedicado.',
  async execute(message) {
    const queue = message.client.distube.getQueue(message);

    // Obter a categoria do canal onde o comando foi chamado
    const parentCategoryId = message.channel.parentId;

    // Verificar ou criar o canal de texto na mesma categoria
    let queueChannel = message.guild.channels.cache.find(
      (channel) => channel.name === '🎵-fila-musical' && channel.type === ChannelType.GuildText
    );

    if (!queueChannel) {
      queueChannel = await message.guild.channels.create({
        name: '🎵-fila-musical',
        type: ChannelType.GuildText,
        topic: 'Canal dedicado para mostrar a fila de músicas',
        parent: parentCategoryId,
        permissionOverwrites: [
          {
            id: message.guild.roles.everyone.id,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ReadMessageHistory],
            deny: [PermissionsBitField.Flags.SendMessages],
          },
        ],
      });

      message.channel.send('✅ Canal `🎵-fila-musical` criado na mesma categoria para exibir a fila de músicas.');
    }

    // Função para salvar o ID da embed
    const saveEmbedId = (embedId) => {
      fs.writeFileSync(EMBED_DATA_FILE, JSON.stringify({ embedId }, null, 2));
    };

    // Função para carregar o ID da embed
    const loadEmbedId = () => {
      if (fs.existsSync(EMBED_DATA_FILE)) {
        const data = JSON.parse(fs.readFileSync(EMBED_DATA_FILE, 'utf-8'));
        return data.embedId;
      }
      return null;
    };

    // Gera a embed com a fila e a música atual
    const generateEmbed = (queue) => {
      const queueString = queue?.songs
        .slice(1, 11) // Mostra as próximas 10 músicas, no máximo
        .map((song, index) => `${index + 1}. [${song.name}](${song.url}) - \`${song.formattedDuration}\``)
        .join('\n') || 'Nenhuma música na fila.';

      const nowPlaying = queue?.songs[0] || { name: 'Nada', url: '#', formattedDuration: '0:00', user: { tag: 'Ninguém' } };

      return new EmbedBuilder()
        .setTitle('🎶 Fila de Reprodução')
        .setDescription(
          `**Tocando agora:**\n[${nowPlaying.name}](${nowPlaying.url}) - \`${nowPlaying.formattedDuration}\`\n\n` +
          `**Próximas músicas:**\n${queueString}`
        )
        .setColor(0x1db954)
        .setFooter({ text: `Requisitado por ${nowPlaying.user.tag}` });
    };

    const embed = generateEmbed(queue);

    // Adiciona botões para controle da música
    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('play').setLabel('▶️ Play').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('pause').setLabel('⏸️ Pause').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('skip').setLabel('⏭️ Skip').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('stop').setLabel('🛑 Stop').setStyle(ButtonStyle.Danger)
    );

    try {
      // Verifica se a embed já existe e atualiza ou envia uma nova
      const embedId = loadEmbedId();
      let existingMessage = null;

      if (embedId) {
        existingMessage = await queueChannel.messages.fetch(embedId).catch(() => null);
      }

      if (existingMessage) {
        await existingMessage.edit({ embeds: [embed], components: [buttons] });
      } else {
        const newMessage = await queueChannel.send({ embeds: [embed], components: [buttons] });
        saveEmbedId(newMessage.id);
      }

      message.channel.send('✅ Fila de músicas atualizada no canal `🎵-fila-musical`.').then((msg) => {
        setTimeout(() => msg.delete().catch(() => {}), 10000);
      });
    } catch (error) {
      console.error('Erro ao atualizar a fila:', error);
      message.channel.send('❌ Ocorreu um erro ao atualizar a fila de músicas.').then((msg) => {
        setTimeout(() => msg.delete().catch(() => {}), 10000);
      });
    }
  },
};
