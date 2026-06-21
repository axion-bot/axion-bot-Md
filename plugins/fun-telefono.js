import { md5 } from '@realvare/baileys'
import { createCanvas, loadImage } from '@napi-rs/canvas'
import ffmpeg from 'fluent-ffmpeg'
import fs from 'fs'
import path from 'path'

global.doxDatabase = global.doxDatabase || [];
global.doxCache = global.doxCache || {};

const handler = async (m, { conn, text, command }) => {
  if (!global.db.data) global.db.data = {};
  if (!global.db.data.users) global.db.data.users = {};

  const checkUser = (jid) => {
    if (!global.db.data.users[jid]) {
      global.db.data.users[jid] = { euro: 0, hackerato: false, riscatto: 0 };
    }
  };

  if (command === 'hackera') {
    const target = getTarget(text, m);
    if (!target || target === m.sender) return m.reply('*⚠️ Specifica un utente valido da hackerare menzionandolo o rispondendo a un suo messaggio.*');
    
    checkUser(target);
    if (global.db.data.users[target].hackerato) return m.reply('*💀 Questo telefono è già stato compromesso da un attacco ransomware!*');

    const costoRiscatto = Math.floor(Math.random() * 500) + 100;
    global.db.data.users[target].hackerato = true;
    global.db.data.users[target].riscatto = costoRiscatto;

    return m.reply(`*⚔️ ATTACCO EFFETTUATO CON SUCCESSO!*\n\nHai infettato il dispositivo di @${target.split('@')[0]} con il malware AXION.\nIl sistema ha impostato un riscatto di *${costoRiscatto}€* per la decifratura dei dati.`, null, { mentions: [target] });
  }

  if (command === 'paga') {
    checkUser(m.sender);
    const user = global.db.data.users[m.sender];
    
    if (!user.hackerato) return m.reply('*🛡️ Il tuo telefono è perfettamente sicuro. Non hai nessun riscatto da pagare.*');
    if (user.euro < user.riscatto) return m.reply(`*❌ Fondi insufficienti!* Hai bisogno di *${user.riscatto}€* ma possiedi solo *${user.euro}€*. Trova un modo per guadagnarli!`);

    user.euro -= user.riscatto;
    user.hackerato = false;
    user.riscatto = 0;

    return m.reply('*🔓 SISTEMA RIPRISTINATO!* Il pagamento è andato a buon fine. Il malware AXION è stato rimosso dal tuo dispositivo.');
  }

  const target = getTarget(text, m);
  const targetNumber = target.split('@')[0];
  const nome = text || await conn.getName(target);

  checkUser(target);
  const isTargetHacked = global.db.data.users[target].hackerato;
  const riscattoRichiesto = global.db.data.users[target].riscatto;

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
      ctx.strokeStyle = isTargetHacked ? '#ff1744' : '#374248';
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
      drawPhoneBase(isTargetHacked ? '#1a0005' : '#050b0e');
      ctx.fillStyle = isTargetHacked ? '#ff1744' : '#00e676';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(isTargetHacked ? 'SYSTEM BREACHED' : 'AXION OS', 250, 425);
      ctx.font = '12px Arial';
      ctx.fillStyle = '#8696a0';
      ctx.fillText(isTargetHacked ? 'Injecting payload...' : 'Starting system...', 250, 460);
      saveFrame();
    }

    const passSteps = ['', '●', '● ●', '● ● ●', '● ● ● ●'];
    for (let step = 0; step < passSteps.length; step++) {
      for (let f = 0; f < 3; f++) {
        drawPhoneBase(isTargetHacked ? '#1a0005' : '#0b141a');
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('10:42', 45, 42);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(isTargetHacked ? 'BYPASSING SECURITY' : 'Inserisci il PIN', 250, 300);

        ctx.fillStyle = isTargetHacked ? '#2d000b' : '#202c33';
        ctx.beginPath();
        ctx.roundRect(120, 340, 260, 50, 10);
        ctx.fill();

        ctx.fillStyle = isTargetHacked ? '#ff1744' : '#00e676';
        ctx.font = 'bold 22px Arial';
        ctx.fillText(isTargetHacked ? 'CRITICAL ERROR' : passSteps[step], 250, 373);
        
        saveFrame();
      }
    }

    for (let i = 0; i < 35; i++) {
      drawPhoneBase(isTargetHacked ? '#0c0003' : '#0b141a');

      if (isTargetHacked) {
        ctx.fillStyle = '#1f0008';
        ctx.beginPath();
        ctx.roundRect(15, 15, 470, 820, 40);
        ctx.fill();
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#ff1744';
        ctx.stroke();

        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.roundRect(170, 15, 160, 25, [0, 0, 15, 15]);
        ctx.fill();

        ctx.fillStyle = '#ff1744';
        ctx.font = 'bold 26px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('⚠️ DEVICE HACKED ⚠️', 250, 140);

        ctx.fillStyle = '#ff5252';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('I tuoi dati personali sono criptati', 250, 180);

        ctx.save();
        ctx.shadowColor = '#ff1744';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#2d000b';
        ctx.beginPath();
        ctx.arc(250, 320, 80, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.fillStyle = '#ff1744';
        ctx.font = '65px Arial';
        ctx.fillText('💀', 250, 343);

        ctx.fillStyle = '#2d000b';
        ctx.beginPath();
        ctx.roundRect(40, 460, 420, 160, 15);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ff1744';
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 15px Arial';
        ctx.fillText('RANSOMWARE PROTOCOL', 250, 495);
        ctx.fillStyle = '#ff8a80';
        ctx.font = '14px Arial';
        ctx.fillText(`Per sbloccare il telefono digita:`, 250, 530);
        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = '#ff1744';
        ctx.fillText(`.paga`, 250, 565);
        ctx.font = '13px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`Prezzo riscatto: ${riscattoRichiesto}€`, 250, 600);

        ctx.fillStyle = '#ff1744';
        ctx.font = 'bold 12px Arial';
        ctx.fillText('AXION CYBER SECURITY SYSTEM', 250, 770);

      } else {
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
      }

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
        let captionMsg = isTargetHacked 
          ? `*🚨 DISPOSITIVO COMPROMESSO 🚨*\n\n🎯 *Vittima:* ${nome}\n💀 *Stato:* Sotto attacco Ransomware\n💰 *Riscatto:* ${riscattoRichiesto}€\n\n_Usa il comando *.paga* per rimuovere il blocco._`
          : `*📱 Profilo Whatsapp Generato*\n\n🎯 *Target:* ${nome}\n📞 *Numero:* +${targetNumber}`;

        await conn.sendMessage(m.chat, { 
          video: fs.readFileSync(outputPath), 
          gifPlayback: true,
          caption: captionMsg
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

handler.help = ['telefono', 'hackera', 'paga'];
handler.tags = ['giochi'];
handler.command = /^(telefono|profilecard|hackera|paga)$/i;

export default handler;

function getTarget(text, m) {
  if (text?.replace(/[^0-9]/g, '')) return text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
  return m.mentionedJid?.[0] || m.quoted?.sender || m.sender;
}
