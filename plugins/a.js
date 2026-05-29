import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import os from 'os';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`⚡ *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*\n\n💡 _Scrivi:_ ${usedPrefix + command} descrizione del video tiktok`);

  try {
    if (command === 'playtiktok') {
      await m.react('⏳');
      
      let videos = null;
      
      try {
        const searchUrl = `https://api.vreden.my.id/api/tiktok-search?query=${encodeURIComponent(text)}`;
        const searchRes = await fetch(searchUrl);
        if (searchRes.ok) {
          const searchJson = await searchRes.json();
          videos = searchJson.result;
        }
      } catch (e) {
        console.log("Prima API di ricerca fallita, provo la seconda...");
      }

      if (!videos || videos.length === 0) {
        try {
          const backupUrl = `https://api.lolhuman.xyz/api/tiktoksearch?apikey=GataDios&query=${encodeURIComponent(text)}`;
          const backupRes = await fetch(backupUrl);
          if (backupRes.ok) {
            const backupJson = await backupRes.json();
            if (backupJson.result) {
              videos = backupJson.result.map(v => ({
                title: v.title,
                videoUrl: v.url,
                cover: v.thumbnail,
                author: { nickname: v.author }
              }));
            }
          }
        } catch (e) {
          console.log("Seconda API di ricerca fallita");
        }
      }
      
      if (!videos || videos.length === 0) {
        await m.react('❌');
        return m.reply('⚠️ *𝗥𝗶𝘀𝘂𝗹𝘁𝗮𝘁𝗼 𝗻𝗼𝗻 𝘁𝗿𝗼𝘃𝗮𝘁𝗼 su TikTok.* I server di ricerca sono temporaneamente offline.');
      }

      const topVideos = videos.slice(0, 3);
      
      let infoMsg = `┏━━━━━━━━━━━━━━━━━━━┓\n` +
                    `   🎵  *𝙏𝙞𝙠𝙏𝙤𝙠 𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓* 🎵\n` +
                    `┗━━━━━━━━━━━━━━━━━━━┛\n\n` +
                    `🔎 *Risultati per:* _${text}_\n\n`;

      const buttons = [];
      
      topVideos.forEach((vid, index) => {
        const title = vid.title ? (vid.title.length > 50 ? vid.title.substring(0, 47) + '...' : vid.title) : `Video ${index + 1}`;
        const author = vid.author?.nickname || 'Utente';
        
        infoMsg += `*${index + 1}.* 🎬 ${title}\n✍️ *Creatore:* ${author}\n\n`;
        
        buttons.push({
          buttonId: `${usedPrefix}ttdl ${vid.videoUrl}`,
          buttonText: { displayText: `📥 Scarica Video ${index + 1}` },
          type: 1
        });
      });

      infoMsg += `*𝗦𝗲𝗹𝗲𝘇𝗶𝗼𝗻𝗮 𝗶𝗹 𝘃𝗶𝗱𝗲𝗼 𝗰𝗵𝗲 𝗱𝗲𝘀𝗶𝗱𝗲𝗿𝗶 𝘀𝗰𝗮𝗿𝗶𝗰𝗮𝗿𝗲:*`;

      await m.react('✅');
      return await conn.sendMessage(m.chat, {
        image: { url: topVideos[0].cover || 'https://i.imgur.com/vH26bZg.png' },
        caption: infoMsg,
        footer: '\n𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
        buttons: buttons,
        headerType: 4
      }, { quoted: m });
    }

    if (command === 'ttdl') {
      await conn.sendMessage(m.chat, { react: { text: "📥", key: m.key } });

      const videoUrl = text.trim();
      let downloadUrl = null;

      try {
        const dlApiUrl = `https://api.vreden.my.id/api/tiktok?url=${encodeURIComponent(videoUrl)}`;
        const dlRes = await fetch(dlApiUrl);
        if (dlRes.ok) {
          const dlJson = await dlRes.json();
          downloadUrl = dlJson.result?.video?.noWatermark || dlJson.result?.video?.nowm || dlJson.result?.video;
        }
      } catch (e) {
        console.log("Prima API di download fallita, provo la seconda...");
      }

      if (!downloadUrl) {
        try {
          const backupDlUrl = `https://api.lolhuman.xyz/api/tiktok?apikey=GataDios&url=${encodeURIComponent(videoUrl)}`;
          const backupDlRes = await fetch(backupDlUrl);
          if (backupDlRes.ok) {
            const backupDlJson = await backupDlRes.json();
            downloadUrl = backupDlJson.result?.video?.no_watermark || backupDlJson.result?.link;
          }
        } catch (e) {
          console.log("Seconda API di download fallita");
        }
      }

      if (!downloadUrl) {
        throw new Error('Tutte le API di download hanno fallito');
      }

      const tmpDir = os.tmpdir();
      const fileName = `tiktok_${Date.now()}.mp4`;
      const inputPath = path.join(tmpDir, fileName);

      const fileRes = await fetch(downloadUrl);
      if (!fileRes.ok) throw new Error(`HTTP error! status: ${fileRes.status}`);
      
      const arrayBuffer = await fileRes.arrayBuffer();
      fs.writeFileSync(inputPath, Buffer.from(arrayBuffer));

      await conn.sendMessage(m.chat, {
        video: fs.readFileSync(inputPath),
        mimetype: 'video/mp4',
        caption: `✅ *𝐒𝐜𝐚𝐫𝐢𝐜𝐚𝐭о 𝐝𝐚 𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`
      }, { quoted: m });

      if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
      await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });
    }

  } catch (e) {
    console.error("TikTok Handler Error:", e.message);
    await m.react('❌');
    m.reply('🚀 *𝘛𝘪𝘬𝘛𝘰ken 𝘌𝘳𝘳𝘰𝘳:* Impossibile recuperare il video in questo momento. I server di download sono sovraccarichi.');
  }
};

handler.help = ['playtiktok'];
handler.tags = ['downloader'];
handler.command = /^(playtiktok|ttdl)$/i;

export default handler;
