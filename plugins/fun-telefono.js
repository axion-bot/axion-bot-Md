import { md5 } from '@realvare/baileys'
import { createCanvas, loadImage } from '@napi-rs/canvas'
import ffmpeg from 'fluent-ffmpeg'
import fs from 'fs'
import path from 'path'
import { os } from 'os'

global.doxDatabase = global.doxDatabase || [];
global.doxCache = global.doxCache || {};

const handler = async (m, { conn, text }) => {
  const target = getTarget(text, m);
  const targetNumber = target.split('@')[0];
  const nome = text || await conn.getName(target);

  await m.react('⏳');

  let picUrl;
  try {
    picUrl = await conn.profilePictureUrl(target, 'image');
  } catch (e) {
    picUrl = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';
  }

  const tempDir = path.join(process.cwd(), `tmp_canvas_${Date.now()}`);
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

  try {
    const canvas = createCanvas(500, 850);
    const ctx = canvas.getContext('2d');
    
    let profileImg;
    try {
      profileImg = await loadImage(picUrl);
    } catch (e) {
      profileImg = await loadImage('https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png');
    }

    let frameCount = 0;
    const saveFrame = () => {
      const buffer = canvas.toBuffer('image/png');
      const filename = path.join(tempDir, `frame_${String(frameCount).padStart(3, '0')}.png`);
      fs.writeFileSync(filename, buffer);
      frameCount++;
    };

    const drawPhoneBase = (screenColor = '#0b141a') => {
      ctx.fillStyle = '#0b141a';
      ctx.fillRect(0, 0, 500, 850);
      ctx.fillStyle = screenColor;
      ctx.beginPath();
      ctx.roundRect(15, 15, 470, 820, 40);
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#374248';
      ctx.stroke();
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.roundRect(170, 15, 160, 25, [0, 0, 15, 15]);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(175, 815, 150, 5, 10);
      ctx.fill();
    };

    for (let i = 0; i < 5; i++) {
      drawPhoneBase('#000000');
      saveFrame();
    }

    for (let i = 0; i < 8; i++) {
      drawPhoneBase('#050b0e');
      ctx.fillStyle = '#00e676';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('AXION OS', 250, 425);
      ctx.font = '12px Arial';
      ctx.fillStyle = '#8696a0';
      ctx.fillText('Starting system...', 250, 460);
      saveFrame();
    }

    const passSteps = ['', '●', '● ●', '● ● ●', '● ● ● ●'];
    for (let step = 0; step < passSteps.length; step++) {
      for (let f = 0; f < 3; f++) {
        drawPhoneBase('#0b141a');
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('10:42', 45, 42);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Inserisci il PIN', 250, 300);

        ctx.fillStyle = '#202c33';
        ctx.beginPath();
        ctx.roundRect(120, 340, 260, 50, 10);
        ctx.fill();

        ctx.fillStyle = '#00e676';
        ctx.font = 'bold 22px Arial';
        ctx.fillText(passSteps[step], 250, 373);
        
        saveFrame();
      }
    }

    for (let i = 0; i < 35; i++) {
      drawPhoneBase('#0b141a');

      ctx.fillStyle = '#1f2c34';
      ctx.beginPath();
      ctx.roundRect(15, 15, 470, 820, 40);
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#374248';
      ctx.stroke();

      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.roundRect(170, 15, 160, 25, [0, 0, 15, 15]);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('10:42', 45, 42);
      ctx.fillRect(415, 30, 25, 13);
      ctx.fillStyle = '#00e676';
      ctx.fillRect(417, 32, 18, 9);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(440, 34, 2, 5);

      ctx.fillStyle = '#111b21';
      ctx.fillRect(20, 60, 460, 65);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px Arial';
      ctx.fillText('Profilo', 40, 100);

      ctx.save();
      ctx.beginPath();
      ctx.arc(250, 240, 90, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(profileImg, 160, 150, 180, 180);
      ctx.restore();

      ctx.lineWidth = 4;
      ctx.strokeStyle = '#00e676';
      ctx.beginPath();
      ctx.arc(250, 240, 92, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#202c33';
      ctx.beginPath();
      ctx.roundRect(35, 370, 430, 90, 15);
      ctx.fill();
      ctx.fillStyle = '#8696a0';
      ctx.font = '14px Arial';
      ctx.fillText('Nome', 55, 400);
      ctx.fillStyle = '#e9edef';
      ctx.font = 'bold 18px Arial';
      ctx.fillText(nome, 55, 430);

      ctx.fillStyle = '#202c33';
      ctx.beginPath();
      ctx.roundRect(35, 480, 430, 90, 15);
      ctx.fill();
      ctx.fillStyle = '#8696a0';
      ctx.font = '14px Arial';
      ctx.fillText('Telefono', 55, 510);
      ctx.fillStyle = '#e9edef';
      ctx.font = 'bold 18px Arial';
      ctx.fillText(`+${targetNumber}`, 55, 540);

      ctx.fillStyle = '#202c33';
      ctx.beginPath();
      ctx.roundRect(35, 590, 430, 90, 15);
      ctx.fill();
      ctx.fillStyle = '#8696a0';
      ctx.font = '14px Arial';
      ctx.fillText('Info e numero di telefono', 55, 620);
      ctx.fillStyle = '#e9edef';
      ctx.font = 'italic 16px Arial';
      ctx.fillText('Disponibile', 55, 650);

      ctx.fillStyle = '#8696a0';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('AXION CYBER SECURITY SYSTEM', 250, 770);

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(175, 815, 150, 5, 10);
      ctx.fill();

      saveFrame();
    }

    const outputPath = path.join(process.cwd(), `tmp_output_${Date.now()}.mp4`);
    
    ffmpeg()
      .input(path.join(tempDir, 'frame_%03d.png'))
      .inputFPS(10)
      .outputOptions([
        '-pix_fmt yuv420p',
        '-c:v libx264',
        '-movflags +faststart'
      ])
      .output(outputPath)
      .on('end', async () => {
        await conn.sendMessage(m.chat, { 
          video: fs.readFileSync(outputPath), 
          gifPlayback: true,
          caption: `*📱 Profilo Whatsapp Hacked*\n\n🎯 *Target:* ${nome}\n📞 *Numero:* +${targetNumber}` 
        }, { quoted: m });

        await m.react('✅');

        fs.unlinkSync(outputPath);
        fs.readdirSync(tempDir).forEach(file => fs.unlinkSync(path.join(tempDir, file)));
        fs.rmdirSync(tempDir);
      })
      .on('error', async (err) => {
        console.error(err);
        await m.react('❌');
        if (fs.existsSync(tempDir)) {
          fs.readdirSync(tempDir).forEach(file => fs.unlinkSync(path.join(tempDir, file)));
          fs.rmdirSync(tempDir);
        }
      })
      .run();

  } catch (error) {
    console.error(error);
    await m.react('❌');
    return conn.sendMessage(m.chat, { text: '*⚠️ Errore durante la generazione dell\'animazione.*' }, { quoted: m });
  }
};

handler.help = ['telefono'];
handler.tags = ['giochi'];
handler.command = /^(telefono|profilecard)$/i;

export default handler;

function getTarget(text, m) {
  if (text?.replace(/[^0-9]/g, '')) return text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
  return m.mentionedJid?.[0] || m.quoted?.sender || m.sender;
}
