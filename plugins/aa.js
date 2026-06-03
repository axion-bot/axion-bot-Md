import { createCanvas, loadImage } from 'canvas';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`*🔍 USO:* ${usedPrefix}${command} <nome persona>\n*Esempio:* ${usedPrefix}${command} Alessia`);

  if (text.length > 15) return m.reply('*⚠️ Nome troppo lungo!* Massimo 15 caratteri per mantenere l\'effetto realistico.');

  await m.react('⏳');

  try {
    const sfondoUrl = 'https://images.unsplash.com/photo-1590246814883-57c511e76523?q=80&w=800&auto=format&fit=crop';
    
    const imgSfondo = await loadImage(sfondoUrl);
    
    const canvas = createCanvas(imgSfondo.width, imgSfondo.height);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(imgSfondo, 0, 0, canvas.width, canvas.height);

    ctx.save();

    ctx.translate(canvas.width / 2.1, canvas.height / 1.9);

    ctx.rotate(-0.15);

    ctx.font = 'italic bold 38px "Courier New", Georgia, Serif';
    ctx.fillStyle = 'rgba(20, 24, 30, 0.82)'; 
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;

    ctx.globalCompositeOperation = 'multiply';

    ctx.fillText(text, 0, 0);

    ctx.restore();

    const buffer = canvas.toBuffer('image/jpeg', { quality: 0.95 });

    await conn.sendMessage(m.chat, {
      image: buffer,
      caption: `✨ *Ecco la tua dedica per ${text}*`
    }, { quoted: m });

    await m.react('✅');

  } catch (error) {
    console.error(error);
    await m.react('❌');
    m.reply('*❌ Si è verificato un errore durante la generazione della dedica.*');
  }
};

handler.help = ['dedica'];
handler.tags = ['canvas', 'fun'];
handler.command = /^(dedica|braccio)$/i;

export default handler;
