import yts from 'yt-search';
import ytdl from '@distube/ytdl-core';
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
    const inputPath = path.join(tmpDir, `${fileName}.mp4`);

    const cookieTxtPath = path.join(process.cwd(), 'cookies.txt');
    const cookieJsonPath = path.join(process.cwd(), 'cookies.json');
    let agent;

    if (fs.existsSync(cookieJsonPath)) {
        agent = ytdl.createAgent(JSON.parse(fs.readFileSync(cookieJsonPath, 'utf8')));
    } else if (fs.existsSync(cookieTxtPath)) {
        agent = ytdl.createAgent(fs.readFileSync(cookieTxtPath, 'utf8'));
    }

    await new Promise((resolve, reject) => {
        try {
            const stream = ytdl(url, { 
                filter: isAudio ? 'audioonly' : 'videoandaudio', 
                quality: 'highest',
                agent: agent
            });
            
            const fileStream = fs.createWriteStream(inputPath);
            stream.pipe(fileStream);
            stream.on('end', resolve);
            stream.on('error', reject);
        } catch (err) {
            reject(err);
        }
    });

    if (isAudio) {
        const voicePath = path.join(tmpDir, `${fileName}.ogg`);

        await new Promise((resolve, reject) => {
            exec(
                `ffmpeg -hide_banner -loglevel error -y -i "${inputPath}" -map_metadata -1 -vn -ar 48000 -ac 1 -c:a libopus -b:a 64k -application voip -f ogg "${voicePath}"`,
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
            video: fs.readFileSync(inputPath),
            mimetype: 'video/mp4',
            caption: `✅ *𝐒𝐜𝐚𝐫𝐢𝐜𝐚𝐭𝐨 𝐝𝐚 𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`
        }, { quoted: m });
    }

    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

  } catch (e) {
    console.error("Handler Error:", e.message);
    m.reply('🚀 *𝙋𝙡𝙖𝙮 𝙀𝙧𝙧𝙤𝙧:* Errore nel caricamento del file. Riprova più tardi o cambia traccia.');
  }
};

handler.help = ['play'];
handler.tags = ['downloader'];
handler.command = /^(play|playaud|playvid)$/i;

export default handler;
