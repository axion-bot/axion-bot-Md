import { createCanvas, loadImage } from 'canvas';

const handler = async (m, { conn, command, text, isAdmin }) => {
  const BOT_OWNERS = (global.owner || []).map(o => o[0] + '@s.whatsapp.net');
  let mentionedJid = m.mentionedJid?.[0] || m.quoted?.sender;

  if (!mentionedJid && text) {
    let number = text.replace(/[^0-9]/g, '');
    if (number.length >= 8) mentionedJid = number + '@s.whatsapp.net';
  }

  const chatId = m.chat;
  const botNumber = conn.user.jid;

  let groupOwner = null;
  try {
    const metadata = await conn.groupMetadata(chatId);
    groupOwner = metadata.owner;
  } catch { groupOwner = null }

  if (!isAdmin) throw '⚠️ Solo gli amministratori possono gestire il mute.';

  if (!mentionedJid) return m.reply(`💡 *Esempio:* .${command} @tag o rispondi a un messaggio.`);

  if ([groupOwner, botNumber, ...BOT_OWNERS].includes(mentionedJid))
    throw '🛡️ *PROTEZIONE:* Impossibile agire su questo utente (Owner/Bot).';

  if (!global.db.data.users[mentionedJid]) global.db.data.users[mentionedJid] = { muto: false };
  const user = global.db.data.users[mentionedJid];
  const isMute = command === 'muta';
  const tag = '@' + mentionedJid.split('@')[0];

  if (isMute) {
    if (user.muto) throw '🔇 L\'utente è già in silenzio.';
    user.muto = true;
  } else {
    if (!user.muto) throw '🔊 L\'utente non è attualmente mutato.';
    user.muto = false;
  }

  // --- GENERAZIONE CANVAS ---
  const canvas = createCanvas(800, 300);
  const ctx = canvas.getContext('2d');

  // Sfondo Sfumato (Gradient)
  const gradient = ctx.createLinearGradient(0, 0, 800, 0);
  gradient.addColorStop(0, isMute ? '#2c0b0e' : '#0b2c14'); // Rosso scuro o Verde scuro
  gradient.addColorStop(1, '#121212');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 800, 300);

  // Bordi estetici
  ctx.strokeStyle = isMute ? '#ff4b5c' : '#4bffb3';
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, 790, 290);

  // Foto Profilo (Cerchio)
  let pp;
  try { pp = await conn.profilePictureUrl(mentionedJid, 'image') } catch { pp = 'https://i.imgur.com/8K9mXz4.png' }
  const avatar = await loadImage(pp);
  
  ctx.save();
  ctx.beginPath();
  ctx.arc(150, 150, 100, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar, 50, 50, 200, 200);
  ctx.restore();

  // Testo
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 45px Arial';
  ctx.fillText(isMute ? 'MUTE ATTIVATO' : 'MUTE RIMOSSO', 280, 120);
  
  ctx.font = '30px Arial';
  ctx.fillStyle = '#cccccc';
  ctx.fillText(`Utente: ${tag.replace('@', '')}`, 280, 170);
  
  ctx.font = 'bold 35px Arial';
  ctx.fillStyle = isMute ? '#ff4b5c' : '#4bffb3';
  ctx.fillText(isMute ? '🔇 SILENZIATO' : '🔊 LIBERO', 280, 220);

  // --- INVIO MESSAGGIO ---
  const caption = isMute 
    ? `✨ *SISTEMA DI MODERAZIONE* ✨\n\n🛑 ${tag}, il tuo diritto di parola è stato sospeso.\n⚖️ *Azione:* Mute\n🛡️ *Eseguito da:* Admin`
    : `✨ *SISTEMA DI MODERAZIONE* ✨\n\n✅ ${tag}, ora puoi tornare a scrivere nel gruppo.\n⚖️ *Azione:* Unmute\n🔔 *Stato:* Reintegrato`;

  await conn.sendMessage(chatId, { 
    image: canvas.toBuffer(), 
    caption: caption,
    mentions: [mentionedJid]
  }, { quoted: m });
};

handler.command = /^(muta|smuta)$/i;
handler.group = true;
handler.botAdmin = true;
handler.admin = true;

export default handler;
