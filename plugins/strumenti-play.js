import yts from 'yt-search';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`⚡ *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*\n\n💡 _Scrivi:_ ${usedPrefix + command} nome canzone`);

  try {
    const search = await yts(text);
    const vid = search.videos[0];
    if (!vid) return m.reply('⚠️ *𝗥𝗶𝘀𝘂𝗹𝘁𝗮𝘁𝗼 𝗻𝗼𝗻 𝘁𝗿𝗼𝘃𝗮𝘁𝗼.*');

    const url = vid.url;

    if (command === 'play') {
        let infoMsg = `┏━━━━━━━━━━━━━━━━━━━┓\n` +
                      `   🎧  *𝙋𝙡𝙖𝙮 𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓* 🎧\n` +
                      `┗━━━━━━━━━━━━━━━━━━━┛\n\n` +
                      `◈ 📌 *𝗧𝗶𝘁𝗼𝗹𝗼:* ${vid.title}\n` +
                      `◈ ⏱️ *𝗗𝘂𝗿𝗮𝘁𝗮:* ${vid.timestamp}\n\n` +
                      `*𝗦𝗲𝗹𝗲𝘇𝗶𝗼𝗻𝗮 𝗶𝗹 𝗳𝗼𝗿𝗺𝗮𝘁𝗼:*`;

        return await conn.sendMessage(m.chat, {
            image: { url: vid.thumbnail },
            caption: infoMsg,
            footer: '\n𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
            buttons: [
                { buttonId: `${usedPrefix}playaud ${url}`, buttonText: { displayText: '🎵 𝗔𝗨𝗗𝗜𝗢 (𝗠𝗣𝟯)' }, type: 1 },
                { buttonId: `${usedPrefix}playvid ${url}`, buttonText: { displayText: '🎬 𝗩𝗜𝗗𝗘𝗢 (𝗠𝗣𝟰)' }, type: 1 }
            ],
            headerType: 4
        }, { quoted: m });
    }

    await conn.sendMessage(m.chat, { react: { text: "📥", key: m.key } });

    const isAudio = command === 'playaud';
    const tmpDir = os.tmpdir();
    const fileName = `file_${Date.now()}`;
    const outputFormat = isAudio ? 'mp3' : 'mp4';
    const downloadPath = path.join(tmpDir, `${fileName}.${outputFormat}`);

    let ytDlpCommand = `yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" --no-playlist --merge-output-format mp4 "${url}" -o "${downloadPath}"`;
    if (isAudio) {
        ytDlpCommand = `yt-dlp -f bestaudio --no-playlist --extract-audio --audio-format mp3 --audio-quality 0 "${url}" -o "${downloadPath}"`;
    }

    await new Promise((resolve, reject) => {
        exec(ytDlpCommand, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });

    if (isAudio) {
        const voicePath = path.join(tmpDir, `${fileName}.ogg`);

        await new Promise((resolve, reject) => {
            exec(
                `ffmpeg -hide_banner -loglevel error -y -i "${downloadPath}" -map_metadata -1 -vn -ar 48000 -ac 1 -c:a libopus -b:a 64k -application voip -f ogg "${voicePath}"`,
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        await conn.sendMessage(m.chat, {
            audio: fs.readFileSync(voicePath),
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true
        }, { quoted: m });

        if (fs.existsSync(voicePath)) fs.unlinkSync(voicePath);
    } else {
        await conn.sendMessage(m.chat, {
            video: fs.readFileSync(downloadPath),
            mimetype: 'video/mp4',
            caption: `✅ *𝐒𝐜𝐚𝐫𝐢𝐜𝐚𝐭𝐨 𝐝𝐚 𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`
        }, { quoted: m });
    }

    if (fs.existsSync(downloadPath)) fs.unlinkSync(downloadPath);
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

  } catch (e) {
    console.error("Handler Error:", e.message);
    m.reply('🚀 *𝙋𝙡𝙖𝙮 𝙀𝙧𝙧𝙤rer:* Impossibile scaricare il file multimediale direttamente da YouTube. Riprova più tardi.');
  }
};

handler.help = ['play'];
handler.tags = ['downloader'];
handler.command = /^(play|playaud|playvid)$/i;

export default handler;
